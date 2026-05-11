export interface ScrapedContent {
  title: string;
  content: string;
  url: string;
  success: boolean;
  error?: string;
}

const CORS_PROXY = 'https://api.codetabs.com/v1/proxy?quest=';

async function fetchWithProxy(url: string): Promise<ScrapedContent> {
  const cleanUrl = url.replace(/^https?:\/\//, '');
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent('https://' + cleanUrl)}`;

  try {
    const response = await fetch(proxyUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let content = bodyMatch ? bodyMatch[1] : html;

    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...';
    }

    return {
      title,
      content,
      url,
      success: true,
    };
  } catch (error) {
    throw error;
  }
}

async function fetchWithJina(url: string): Promise<ScrapedContent> {
  const cleanUrl = url.replace(/^https?:\/\//, '');
  const jinaUrl = `https://r.jina.ai/http://${cleanUrl}`;

  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'text/plain',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();

  if (!text || text.trim().length < 10) {
    throw new Error('返回内容为空');
  }

  let title = '';
  let content = text;

  if (text.startsWith('Title:')) {
    const titleEnd = text.indexOf('\n');
    title = text.substring(6, titleEnd).trim();
    content = text.substring(titleEnd + 1).trim();
  }

  content = content
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .replace(/[#*_`]/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (content.length > 10000) {
    content = content.substring(0, 10000) + '\n\n[内容过长，已截断...]';
  }

  return {
    title,
    content,
    url,
    success: true,
  };
}

export async function fetchWebContent(url: string): Promise<ScrapedContent> {
  try {
    console.log('尝试 Jina 抓取...');
    return await fetchWithJina(url);
  } catch (jinaError) {
    console.log('Jina 失败，尝试备用方案...');
    try {
      return await fetchWithProxy(url);
    } catch (proxyError) {
      console.error('备用方案也失败:', proxyError);
      return {
        title: '',
        content: '',
        url,
        success: false,
        error: '抓取服务暂时不可用，请尝试直接复制文章内容到笔记中',
      };
    }
  }
}

export async function summarizeContent(content: string, apiKey: string, baseUrl?: string): Promise<string> {
  try {
    const response = await fetch(baseUrl || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `你是一个知识整理助手。请阅读以下文章内容，然后：
1. 用简洁的语言总结核心要点（3-5条）
2. 提取关键术语和概念
3. 生成2-3个复习问题

回复格式：
## 核心要点
- 要点1
- 要点2

## 关键术语
术语1、术语2

## 复习问题
1. 问题1
2. 问题2`,
          },
          {
            role: 'user',
            content: content.substring(0, 8000),
          },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI 总结失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Summarize error:', error);
    return '';
  }
}
