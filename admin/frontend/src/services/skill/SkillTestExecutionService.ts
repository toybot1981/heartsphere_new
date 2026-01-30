/**
 * 技能测试执行服务
 * 调用 Main 后端 /api/skills/execute 执行技能（用于管理端「测试」功能）
 * 需配置 VITE_MAIN_BACKEND_URL（如 http://localhost:8081），可选 VITE_MAIN_API_KEY
 */

const MAIN_BACKEND_URL = import.meta.env.VITE_MAIN_BACKEND_URL || '';
const MAIN_API_KEY = import.meta.env.VITE_MAIN_API_KEY || '';

export interface SkillExecutionResultDTO {
  skillId: string;
  success: boolean;
  result?: unknown;
  errorMessage?: string;
  executionTimeMs?: number;
}

export interface ExecuteOptions {
  skillId: string;
  /** 用户输入内容，会作为 parameters.input 或 parameters.message 传入 */
  inputText?: string;
  /** 额外参数（如 characterId 等） */
  parameters?: Record<string, unknown>;
  /** 实时日志回调，用于在测试框内逐行输出过程 */
  onLog?: (line: string) => void;
  /** 使用 SSE 流式接口（/api/skills/execute/stream）获取实时事件，默认 true */
  useStream?: boolean;
}

/**
 * 调用 Main 后端执行技能
 * 若未配置 VITE_MAIN_BACKEND_URL，返回 null 并可通过 onLog 提示
 * 默认使用 SSE 流式接口（useStream: true），可设为 false 使用普通 POST
 */
export async function executeSkillForTest(options: ExecuteOptions): Promise<SkillExecutionResultDTO | null> {
  const { useStream = true } = options;
  if (useStream) {
    return executeSkillForTestStream(options);
  }
  return executeSkillForTestNonStream(options);
}

/**
 * SSE 流式执行：POST /api/skills/execute/stream，解析 event: start / result / error
 */
async function executeSkillForTestStream(options: ExecuteOptions): Promise<SkillExecutionResultDTO | null> {
  const { skillId, inputText = '', parameters = {}, onLog } = options;

  if (!MAIN_BACKEND_URL) {
    const msg = '未配置 Main 后端地址（VITE_MAIN_BACKEND_URL），无法执行测试。';
    onLog?.(msg);
    console.warn('[SkillTest]', msg);
    return null;
  }

  const params: Record<string, unknown> = { ...parameters };
  if (inputText.trim()) {
    params.input = inputText.trim();
    params.message = inputText.trim();
  }

  const url = `${MAIN_BACKEND_URL.replace(/\/$/, '')}/api/skills/execute/stream`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  if (MAIN_API_KEY) {
    headers['X-API-Key'] = MAIN_API_KEY;
    headers['Authorization'] = `Bearer ${MAIN_API_KEY}`;
  }

  const log = (msg: string) => {
    onLog?.(msg);
    console.log('[SkillTest]', msg);
  };
  const body = {
    skillId,
    parameters: params,
    characterId: params.characterId ?? null,
    additionalContext: params.additionalContext ?? null,
  };
  log('开始执行技能（SSE 流式）…');
  log(`请求: POST ${url}`);
  log('');
  console.log('[SkillTest] 请求体:', body);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      log(`响应状态: ${res.status} ${res.statusText}`);
      log(`请求失败: ${text || res.statusText}`);
      return {
        skillId,
        success: false,
        errorMessage: text || `HTTP ${res.status}`,
      };
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) {
      log('响应无 body');
      return { skillId, success: false, errorMessage: '响应无 body' };
    }

    let buffer = '';
    let currentEvent = '';
    let currentData = '';
    let finalResult: SkillExecutionResultDTO | null = null;

    const processLines = (lines: string[]) => {
      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          const part = line.slice(5).trim();
          currentData = currentData ? currentData + '\n' + part : part;
        } else if (line === '') {
          if (currentEvent && currentData) {
            try {
              const data = JSON.parse(currentData) as Record<string, unknown>;
              if (currentEvent === 'start') {
                const sid = data.skillId ?? '';
                log(`[SSE] start skillId=${sid}`);
                console.log('[SkillTest] [SSE] start 原始数据:', data);
              } else if (currentEvent === 'result') {
                log('[SSE] result');
                const dto = data as unknown as SkillExecutionResultDTO;
                console.log('[SkillTest] [SSE] result 完整 DTO:', dto);
                const outerSuccess = dto.success === true || dto.success === 'true';
                const innerResult = dto.result as Record<string, unknown> | undefined;
                const innerSuccess = innerResult != null && typeof innerResult.success === 'boolean' ? innerResult.success : null;
                if (outerSuccess) {
                  if (innerSuccess === false) {
                    const msg = (innerResult?.message as string) ?? (innerResult?.errorMessage as string) ?? '技能返回未成功';
                    log(`执行完成，但技能返回未成功: ${msg}`);
                  } else {
                    log('执行成功。');
                  }
                  if (dto.executionTimeMs != null) log(`耗时: ${dto.executionTimeMs} ms`);
                } else {
                  log(`执行失败: ${dto.errorMessage ?? '未知错误'}`);
                }
                finalResult = {
                  skillId: String(dto.skillId ?? skillId),
                  success: !!outerSuccess,
                  result: dto.result,
                  errorMessage: dto.errorMessage,
                  executionTimeMs: dto.executionTimeMs,
                };
              } else if (currentEvent === 'error') {
                const msg = (data.message as string) ?? '执行失败';
                log(`[SSE] error: ${msg}`);
                console.log('[SkillTest] [SSE] error 原始数据:', data);
                finalResult = {
                  skillId,
                  success: false,
                  errorMessage: msg,
                };
              }
            } catch (e) {
              log(`解析 SSE 数据失败: ${currentData.slice(0, 100)}`);
              console.warn('[SkillTest] 解析 SSE 失败', e, 'data:', currentData);
            }
          }
          currentEvent = '';
          currentData = '';
        }
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      processLines(lines);
    }
    if (buffer) processLines(buffer.split('\n'));

    if (finalResult) {
      console.log('[SkillTest] 最终结果:', finalResult);
      return finalResult;
    }
    log('SSE 流结束但未收到 result/error 事件');
    return {
      skillId,
      success: false,
      errorMessage: 'SSE 流结束但未收到 result/error 事件',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`请求异常: ${msg}`);
    console.warn('[SkillTest] 请求异常', err);
    return {
      skillId,
      success: false,
      errorMessage: msg,
    };
  }
}

/**
 * 普通 POST 执行：POST /api/skills/execute
 */
async function executeSkillForTestNonStream(options: ExecuteOptions): Promise<SkillExecutionResultDTO | null> {
  const { skillId, inputText = '', parameters = {}, onLog } = options;

  if (!MAIN_BACKEND_URL) {
    const msg = '未配置 Main 后端地址（VITE_MAIN_BACKEND_URL），无法执行测试。';
    onLog?.(msg);
    console.warn('[SkillTest]', msg);
    return null;
  }

  const params: Record<string, unknown> = { ...parameters };
  if (inputText.trim()) {
    params.input = inputText.trim();
    params.message = inputText.trim();
  }

  const url = `${MAIN_BACKEND_URL.replace(/\/$/, '')}/api/skills/execute`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (MAIN_API_KEY) {
    headers['X-API-Key'] = MAIN_API_KEY;
    headers['Authorization'] = `Bearer ${MAIN_API_KEY}`;
  }

  const log = (msg: string) => {
    onLog?.(msg);
    console.log('[SkillTest]', msg);
  };
  log('开始执行技能…');
  log(`请求: POST ${url}`);
  log('');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        skillId,
        parameters: params,
        characterId: params.characterId ?? null,
        additionalContext: params.additionalContext ?? null,
      }),
    });

    const text = await res.text();
    log(`响应状态: ${res.status} ${res.statusText}`);
    console.log('[SkillTest] 响应 body:', text?.slice(0, 500) + (text && text.length > 500 ? '...' : ''));

    if (!res.ok) {
      log(`请求失败: ${text || res.statusText}`);
      return {
        skillId,
        success: false,
        errorMessage: text || `HTTP ${res.status}`,
      };
    }

    let data: { code?: number; data?: SkillExecutionResultDTO; message?: string };
    try {
      data = JSON.parse(text) as { code?: number; data?: SkillExecutionResultDTO; message?: string };
    } catch {
      log(`响应非 JSON: ${text.slice(0, 200)}`);
      return { skillId, success: false, errorMessage: '响应格式错误' };
    }

    const dto = data?.data ?? (data as unknown as SkillExecutionResultDTO);
    if (dto && typeof dto === 'object' && 'skillId' in dto) {
      console.log('[SkillTest] 响应 DTO:', dto);
      log(dto.success ? '执行成功。' : `执行失败: ${dto.errorMessage || '未知错误'}`);
      if (dto.executionTimeMs != null) {
        log(`耗时: ${dto.executionTimeMs} ms`);
      }
      return dto as SkillExecutionResultDTO;
    }

    log(`响应结构异常: ${JSON.stringify(data).slice(0, 300)}`);
    return {
      skillId,
      success: false,
      errorMessage: (data as { message?: string })?.message || '响应结构异常',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    log(`请求异常: ${msg}`);
    console.warn('[SkillTest] 请求异常', err);
    return {
      skillId,
      success: false,
      errorMessage: msg,
    };
  }
}

export function isSkillTestExecutionConfigured(): boolean {
  return !!MAIN_BACKEND_URL;
}
