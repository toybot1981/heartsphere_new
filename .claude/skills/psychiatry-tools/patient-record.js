// .claude/skills/psychiatry-tools/patient-record.js
/**
 * 患者病历管理 Skill
 * 用于创建、查看、更新患者病历信息
 */

module.exports = {
  name: "patient-record",
  description: "患者病历管理工具 - 创建、查看、更新患者病历",
  version: "1.0.0",
  author: "HeartSphere Psychiatry Team",

  args: {
    action: {
      type: "string",
      required: true,
      description: "操作类型: create, view, update, list, search, delete",
      enum: ["create", "view", "update", "list", "search", "delete"]
    },
    patientId: {
      type: "string",
      description: "患者ID"
    },
    data: {
      type: "object",
      description: "患者数据 (JSON格式)"
    },
    searchQuery: {
      type: "string",
      description: "搜索关键词（姓名、诊断、ID）"
    }
  },

  usage: `
    创建病历:
      /patient-record --action=create --data='{"name":"张三","age":30,"gender":"男","phone":"13800138000"}'

    查看病历:
      /patient-record --action=view --patientId=P001

    更新病历:
      /patient-record --action=update --patientId=P001 --data='{"diagnosis":"抑郁症"}'

    列出所有患者:
      /patient-record --action=list

    搜索患者:
      /patient-record --action=search --searchQuery="张三"

    删除患者:
      /patient-record --action=delete --patientId=P001
  `,

  run: async (args, context) => {
    const { action, patientId, data, searchQuery } = args;
    const { Read, Write, Glob, Bash } = context.tools;

    try {
      const recordsDir = ".claude/data/patients";

      switch (action) {
        case "create":
          return await createPatientRecord(data, recordsDir, { Write });
        case "view":
          return await viewPatientRecord(patientId, recordsDir, { Read });
        case "update":
          return await updatePatientRecord(patientId, data, recordsDir, { Read, Write });
        case "list":
          return await listPatientRecords(recordsDir, { Glob, Read });
        case "search":
          return await searchPatients(searchQuery, recordsDir, { Glob, Read });
        case "delete":
          return await deletePatientRecord(patientId, recordsDir, { Bash });
        default:
          throw new Error(`未知的操作类型: ${action}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        suggestion: getSuggestion(error.message)
      };
    }
  }
};

/**
 * 创建患者病历
 */
async function createPatientRecord(data, recordsDir, { Write }) {
  if (!data || !data.name) {
    throw new Error("患者姓名不能为空");
  }

  // 数据验证
  validatePatientData(data);

  // 生成患者ID
  const patientId = generatePatientId();
  const createdAt = new Date().toISOString();

  const record = {
    id: patientId,
    ...data,
    // 标准化字段
    name: data.name.trim(),
    age: parseInt(data.age) || 0,
    gender: normalizeGender(data.gender),
    phone: data.phone ? data.phone.trim() : "",
    email: data.email ? data.email.trim().toLowerCase() : "",
    diagnosis: data.diagnosis || "",
    medications: data.medications || [],
    allergies: data.allergies || [],
    // 元数据
    createdAt,
    updatedAt: createdAt,
    visits: [],
    status: "active",
    tags: data.tags || []
  };

  const filePath = `${recordsDir}/${patientId}.json`;

  await Write(filePath, JSON.stringify(record, null, 2));

  return {
    success: true,
    message: "患者病历创建成功",
    data: {
      patientId,
      record
    }
  };
}

/**
 * 查看患者病历
 */
async function viewPatientRecord(patientId, recordsDir, { Read }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  const filePath = `${recordsDir}/${patientId}.json`;

  try {
    const content = await Read(filePath);
    const record = JSON.parse(content);

    return {
      success: true,
      message: "查询成功",
      data: record
    };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new Error(`患者不存在: ${patientId}`);
    }
    throw error;
  }
}

/**
 * 更新患者病历
 */
async function updatePatientRecord(patientId, data, recordsDir, { Read, Write }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  const filePath = `${recordsDir}/${patientId}.json`;

  try {
    const content = await Read(filePath);
    const record = JSON.parse(content);

    // 更新字段
    const updated = {
      ...record,
      ...data,
      id: record.id, // 保持ID不变
      createdAt: record.createdAt, // 保持创建时间不变
      updatedAt: new Date().toISOString()
    };

    await Write(filePath, JSON.stringify(updated, null, 2));

    return {
      success: true,
      message: "患者病历更新成功",
      data: updated
    };
  } catch (error) {
    if (error.message.includes("not found")) {
      throw new Error(`患者不存在: ${patientId}`);
    }
    throw error;
  }
}

/**
 * 列出所有患者
 */
async function listPatientRecords(recordsDir, { Glob, Read }) {
  try {
    const files = await Glob(`${recordsDir}/*.json`);

    const patients = await Promise.all(
      files.map(async (file) => {
        const content = await Read(file);
        const record = JSON.parse(content);
        return {
          id: record.id,
          name: record.name,
          age: record.age,
          gender: record.gender,
          diagnosis: record.diagnosis,
          status: record.status,
          createdAt: record.createdAt,
          lastVisit: record.visits && record.visits.length > 0
            ? record.visits[record.visits.length - 1].date
            : null,
          tags: record.tags || []
        };
      })
    );

    return {
      success: true,
      message: `共找到 ${patients.length} 位患者`,
      data: patients
    };
  } catch (error) {
    return {
      success: true,
      message: "暂无患者记录",
      data: []
    };
  }
}

/**
 * 生成患者ID
 */
function generatePatientId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `P${timestamp}${random}`;
}

/**
 * 验证患者数据
 */
function validatePatientData(data) {
  // 姓名验证
  if (!data.name || data.name.trim().length === 0) {
    throw new Error("患者姓名不能为空");
  }
  if (data.name.trim().length > 50) {
    throw new Error("患者姓名不能超过50个字符");
  }

  // 年龄验证
  const age = parseInt(data.age);
  if (isNaN(age) || age < 0 || age > 150) {
    throw new Error("年龄必须在0-150之间");
  }

  // 性别验证
  const validGenders = ["男", "女", "男性", "女性", "male", "female", "M", "F", "其他"];
  if (data.gender && !validGenders.includes(data.gender)) {
    throw new Error("性别值无效，必须是：男、女、或其他");
  }

  // 电话验证（可选）
  if (data.phone) {
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(data.phone.trim())) {
      throw new Error("电话号码格式不正确");
    }
  }

  // 邮箱验证（可选）
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      throw new Error("邮箱地址格式不正确");
    }
  }

  // 诊断验证（可选）
  if (data.diagnosis && data.diagnosis.length > 200) {
    throw new Error("诊断描述不能超过200个字符");
  }
}

/**
 * 标准化性别字段
 */
function normalizeGender(gender) {
  if (!gender) return "未指定";

  const genderMap = {
    "男": "男",
    "男性": "男",
    "male": "男",
    "M": "男",
    "女": "女",
    "女性": "女",
    "female": "女",
    "F": "女"
  };

  return genderMap[gender] || gender;
}

/**
 * 搜索患者
 */
async function searchPatients(searchQuery, recordsDir, { Glob, Read }) {
  if (!searchQuery || searchQuery.trim().length === 0) {
    throw new Error("搜索关键词不能为空");
  }

  const query = searchQuery.trim().toLowerCase();

  try {
    const files = await Glob(`${recordsDir}/*.json`);

    const allPatients = await Promise.all(
      files.map(async (file) => {
        const content = await Read(file);
        return JSON.parse(content);
      })
    );

    // 搜索逻辑：匹配姓名、ID、诊断、电话
    const results = allPatients.filter(patient => {
      const nameMatch = patient.name && patient.name.toLowerCase().includes(query);
      const idMatch = patient.id && patient.id.toLowerCase().includes(query);
      const diagnosisMatch = patient.diagnosis && patient.diagnosis.toLowerCase().includes(query);
      const phoneMatch = patient.phone && patient.phone.includes(query);
      const emailMatch = patient.email && patient.email.toLowerCase().includes(query);

      return nameMatch || idMatch || diagnosisMatch || phoneMatch || emailMatch;
    });

    // 返回简化的结果列表
    const summary = results.map(patient => ({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      diagnosis: patient.diagnosis,
      phone: patient.phone,
      status: patient.status,
      matchReason: getMatchReason(patient, query)
    }));

    return {
      success: true,
      message: `找到 ${summary.length} 位匹配的患者`,
      data: summary
    };
  } catch (error) {
    return {
      success: true,
      message: "搜索失败",
      data: []
    };
  }
}

/**
 * 删除患者记录
 */
async function deletePatientRecord(patientId, recordsDir, { Bash }) {
  if (!patientId) {
    throw new Error("患者ID不能为空");
  }

  const filePath = `${recordsDir}/${patientId}.json`;

  try {
    // 使用 Bash 工具删除文件
    await Bash(`rm "${filePath}"`);

    return {
      success: true,
      message: "患者记录已删除",
      data: { patientId }
    };
  } catch (error) {
    throw new Error(`删除失败: ${error.message}`);
  }
}

/**
 * 获取匹配原因
 */
function getMatchReason(patient, query) {
  const reasons = [];

  if (patient.name && patient.name.toLowerCase().includes(query)) {
    reasons.push("姓名");
  }
  if (patient.id && patient.id.toLowerCase().includes(query)) {
    reasons.push("ID");
  }
  if (patient.diagnosis && patient.diagnosis.toLowerCase().includes(query)) {
    reasons.push("诊断");
  }
  if (patient.phone && patient.phone.includes(query)) {
    reasons.push("电话");
  }
  if (patient.email && patient.email.toLowerCase().includes(query)) {
    reasons.push("邮箱");
  }

  return reasons.join("、");
}

/**
 * 获取错误建议
 */
function getSuggestion(errorMessage) {
  const suggestions = {
    "患者姓名不能为空": "请提供患者姓名",
    "年龄必须在0-150之间": "请提供有效的年龄（0-150）",
    "电话号码格式不正确": "请提供有效的11位手机号码",
    "邮箱地址格式不正确": "请提供有效的邮箱地址，例如：user@example.com",
    "患者不存在": "请检查患者ID是否正确",
    "性别值无效": "性别必须是：男、女、或其他"
  };

  return suggestions[errorMessage] || "请检查输入数据格式";
}
