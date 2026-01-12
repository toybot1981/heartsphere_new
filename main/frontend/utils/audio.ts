/**
 * 音频处理工具函数
 * 用于解码和处理音频数据
 */

/**
 * 将 Base64 字符串解码为 Uint8Array
 * @param base64 Base64 编码的字符串
 * @returns 解码后的字节数组
 * @throws 如果解码失败，抛出错误
 */
export function decodeBase64ToBytes(base64: string): Uint8Array {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (error) {
    throw new Error(`Failed to decode base64 audio: ${error}`);
  }
}

/**
 * 将音频数据解码为 AudioBuffer
 * @param data 音频字节数据
 * @param ctx AudioContext 实例
 * @param sampleRate 采样率（默认 24000）
 * @param numChannels 声道数（默认 1）
 * @returns 解码后的 AudioBuffer
 * @throws 如果解码失败，抛出错误
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  try {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  } catch (error) {
    throw new Error(`Failed to decode audio data: ${error}`);
  }
}

