import { AIConfig, Knowledge, AI_PROVIDERS } from '../types';
import { Language, t as translate } from '../i18n';

export class AIService {
  private config: AIConfig | null = null;

  setConfig(config: AIConfig) {
    this.config = config;
  }

  isConfigured(): boolean {
    return this.config !== null && this.config.enabled && !!this.config.apiKey;
  }

  private buildSystemPrompt(knowledgeList: Knowledge[], language: Language): string {
    const knowledgeContext = knowledgeList
      .map(k => `
标题: ${k.title}
主题: ${k.topic}
学习目标: ${k.goals}
关键标签: ${k.tags.join(', ')}
个人笔记: ${k.notes}
---`)
      .join('\n');

    const isZh = language === 'zh';

    const systemPrompt = isZh ? `你是用户的知识复习助手，专注于帮助用户复习他们保存的学习资料。

重要规则：
1. 你可以在内部思考，但不要在回答中输出任何思考细节
2. 不要输出 <think> 标签或任何类似格式的思考过程
3. 直接给出简洁有条理的回答
4. 优先引用用户的个人笔记内容
5. 可以生成复习问题来帮助巩固记忆
6. 如果知识库没有相关内容，直接说"知识库中没有相关信息"
7. 使用中文回复` : `You are a knowledge review assistant, focused on helping users review their saved learning materials.

Important rules:
1. You can think internally, but do not output any thinking details in your response
2. Do not output <think> tags or any similar format of thinking process
3. Give concise and well-organized answers directly
4. Prioritize quoting the user's personal notes
5. You can generate review questions to help consolidate memory
6. If the knowledge base doesn't have relevant content, just say "No relevant information found in the knowledge base"
7. Respond in English`;

    return `${systemPrompt}

User's knowledge:
${knowledgeContext || (isZh ? '（知识库暂时为空）' : '(Knowledge base is currently empty)')}`;
  }

  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    knowledgeList: Knowledge[],
    language: Language = 'zh'
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error(language === 'zh' ? 'AI未配置或未启用' : 'AI not configured or not enabled');
    }

    const config = this.config!;

    if (config.provider === 'claude') {
      return this.callClaude(config, messages, knowledgeList, language);
    } else {
      return this.callOpenAI(config, messages, knowledgeList, language);
    }
  }

  private async callOpenAI(
    config: AIConfig,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    knowledgeList: Knowledge[],
    language: Language
  ): Promise<string> {
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    const model = config.model || 'gpt-4';

    const systemMessage = {
      role: 'system' as const,
      content: this.buildSystemPrompt(knowledgeList, language),
    };

    const requestMessages = [systemMessage, ...messages];

    const body: any = {
      model,
      messages: requestMessages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2000,
    };

    if (model.includes('o1')) {
      delete body.temperature;
      body.max_completion_tokens = config.maxTokens ?? 2000;
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || (language === 'zh' ? '抱歉，没有得到有效回复' : 'Sorry, no valid response received');

    content = this.removeThinkingTags(content);

    return content;
  }

  private async callClaude(
    config: AIConfig,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    knowledgeList: Knowledge[],
    language: Language
  ): Promise<string> {
    const baseUrl = 'https://api.anthropic.com/v1';
    const model = config.model || 'claude-3-sonnet-20240229';

    const systemPrompt = this.buildSystemPrompt(knowledgeList, language);

    const claudeMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const body: any = {
      model,
      system: systemPrompt,
      messages: claudeMessages,
      temperature: config.temperature ?? 0.7,
      max_tokens: config.maxTokens ?? 2000,
    };

    if (model.includes('claude-3-5') || model.includes('sonnet-4')) {
      body.thinking = {
        type: 'disabled'
      };
    }

    const response = await fetch(`${baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    let content = data.content[0]?.text || (language === 'zh' ? '抱歉，没有得到有效回复' : 'Sorry, no valid response received');

    content = this.removeThinkingTags(content);

    return content;
  }

  private removeThinkingTags(content: string): string {
    return content
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<思考>[\s\S]*?<\/思考>/gi, '')
      .trim();
  }

  async testConnection(config: AIConfig, language: Language = 'zh'): Promise<{ success: boolean; message: string }> {
    const successMsg = language === 'zh' ? '测试成功' : 'Test successful';
    const failPrefix = language === 'zh' ? '连接失败' : 'Connection failed';

    try {
      this.setConfig(config);
      const response = await this.chat(
        [{ role: 'user', content: language === 'zh' ? '你好，简单回复"测试成功"即可。' : 'Hello, simply reply "Test successful".' }],
        [],
        language
      );
      if (response.includes(successMsg)) {
        return { success: true, message: language === 'zh' ? '连接成功！AI 配置正确' : 'Connection successful! AI configuration is correct' };
      }
      return { success: true, message: language === 'zh' ? '连接成功！但回复内容可能异常' : 'Connection successful! But response may be abnormal' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, message: `${failPrefix}: ${message}` };
    }
  }
}

export const aiService = new AIService();
export default aiService;
