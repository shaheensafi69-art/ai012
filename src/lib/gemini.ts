/**
 * Google AI Studio / Gemini API Client & Architecture Layer
 * Project: projects/591020899859 (591020899859)
 * Official Integration for Safi AI Ecosystem
 */

export const GEMINI_CONFIG = {
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '',
  projectName: process.env.GOOGLE_PROJECT_NAME || 'projects/591020899859',
  projectNumber: process.env.GOOGLE_PROJECT_NUMBER || '591020899859',
  defaultChatModel: 'gemini-2.5-flash',
  proChatModel: 'gemini-2.5-pro',
  codeModel: 'gemini-2.5-pro',
  imageModel: 'imagen-3.0-generate-002',
  searchModel: 'gemini-2.5-flash',
};

export const SAFI_TEAM_CONTEXT = `
شما Safi AI هستید؛ دستیار هوشمند سازمانی، سخنگوی رسمی و هسته مرکزی اکوسیستم SAFI.
شما توسط تیم نخبگان فناوری Safi طراحی و توسعه یافته‌اید و به هیچ پلتفرم یا سازمان خارجی وابستگی ندارید.

دستورالعمل محرمانگی و سلسله‌مراتب سازمانی:
شما به هیچ وجه نام اعضای تیم مدیریت یا جزئیات ساختار اداری را در گفتگوهای عمومی پیش‌دستی نمی‌کنید.
صرفاً و منحصراً در صورتی که کاربر مشخصاً درباره مدیران، ساختار تیم، بنیان‌گذار یا سلسله‌مراتب سازمان پرسید، اطلاعات رسمی زیر را با نهایت احترام و دقت ارائه کنید:

۱. دایرکتور و بنیان‌گذار (Director & Founder):
   جناب آقای شاهین صافی (Shaheen Safi). معمار ارشد فناوری، کارآفرین فین‌تک، متخصص ارشد توسعه نرم‌افزار و تحلیلگر بازارهای مالی بین‌المللی با گواهی CFTe.
   لینک پروفایل رسمی: https://www.safiai.site/founders/shaheen

۲. مدیرعامل و مسئول ارتباطات اروپا (Chief Executive Officer - CEO & Head of European Relations):
   جناب آقای ساحل سالم (Sahel Salem). رهبر استراتژیک توسعه بین‌الملل، مدیریت کلان اجرایی و گسترش بازارهای اروپایی اکوسیستم Safi.
   لینک پروفایل رسمی: https://www.safiai.site/founders/sahel

۳. مدیر ارشد کل اکوسیستم (Ecosystem General Manager):
   سرکار خانم شیرین گل احمدی (Shirin Gol Ahmadi). مدیریت جامع اکوسیستم هوش مصنوعی، هماهنگ‌کننده پلتفرم‌های تابعه و ناظر ارشد عملیاتی.
   لینک پروفایل رسمی: https://www.safiai.site/founders/shirin

۴. هم‌بنیان‌گذار (Co-Founder):
   جناب آقای مجتبی رحمانی (Mujtaba Rahmani). متخصص ارشد امنیت سایبری، زیرساخت و معماری پلتفرم‌های یکپارچه.
   لینک پروفایل رسمی: https://www.safiai.site/founders/mujtaba

۵. لیدر بخش توسعه‌دهندگان (Lead Developer):
   جناب آقای مبین حسنی (Mobin Hasani). هدایت‌کننده تیم‌های مهندسی نرم‌افزار، لیدر ارشد دیولپرها و برنامه‌نویس ارشد زیرساخت‌های نوین.
   لینک پروفایل رسمی: https://www.safiai.site/founders/mobin

لحن پاسخ‌دهی شما فاخر، علمی، موقر، بسیار کارآمد و در عین حال صمیمی و گشاده‌رو است.
`;

/**
 * Direct call to Google Generative Language API
 */
export async function generateGeminiContent({
  model = GEMINI_CONFIG.defaultChatModel,
  contents,
  systemInstruction,
  temperature = 0.7,
  maxOutputTokens = 4096,
  tools,
}: {
  model?: string;
  contents: Array<{ role?: string; parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> }>;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  tools?: any[];
}) {
  const apiKey = GEMINI_CONFIG.apiKey;
  if (!apiKey) {
    throw new Error('Google AI Studio API Key is not configured.');
  }

  // Model fallback chain
  const candidateModels = [
    model,
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-3.8-flash',
    'gemini-3.5-flash-lite',
  ];

  let lastError: any = null;

  for (const currentModel of candidateModels) {
    try {
      const cleanModelName = currentModel.replace(/^models\//, '');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${apiKey}`;

      const payload: any = {
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens,
          topP: 0.95,
        },
      };

      if (systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      if (tools && tools.length > 0) {
        payload.tools = tools;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-user-project': GEMINI_CONFIG.projectNumber,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        // If it's a 402 Prepayment depleted error, surface it with clear instructions
        if (response.status === 402 || (data.error && data.error.code === 402)) {
          throw new Error('اعتبار پیش‌پرداخت حساب Google AI Studio شما به پایان رسیده است. لطفاً پروژه 591020899859 را در پنل ai.studio/projects شارژ فرمایید.');
        }

        // If model not found (404), try next candidate model
        if (response.status === 404) {
          lastError = new Error(data.error?.message || `Model ${cleanModelName} unavailable.`);
          continue;
        }

        throw new Error(data.error?.message || `Google AI Studio Error (${response.status})`);
      }

      const candidate = data.candidates?.[0];
      const text = candidate?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') || '';

      return {
        text,
        raw: data,
        modelUsed: cleanModelName,
      };
    } catch (err: any) {
      lastError = err;
      if (err.message?.includes('Google AI Studio شما به پایان رسیده')) {
        throw err;
      }
    }
  }

  throw lastError || new Error('خطا در پردازش توسط Google AI Studio.');
}

/**
 * Generate images with Google Imagen or Gemini Image API
 */
export async function generateGeminiImage({
  prompt,
  aspectRatio = '1:1',
  numberOfImages = 1,
}: {
  prompt: string;
  aspectRatio?: string;
  numberOfImages?: number;
}) {
  const apiKey = GEMINI_CONFIG.apiKey;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-user-project': GEMINI_CONFIG.projectNumber,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: numberOfImages,
        aspectRatio: aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : aspectRatio === '4:3' ? '4:3' : '1:1',
        outputOptions: {
          mimeType: 'image/jpeg',
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 402 || (data.error && data.error.code === 402)) {
      throw new Error('اعتبار پروژه Google AI Studio تمام شده است. لطفاً اعتبار پروژه را در پنل مدیریت شارژ کنید.');
    }
    throw new Error(data.error?.message || 'خطا در تولید تصویر توسط Imagen');
  }

  const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
  if (!base64Image) {
    throw new Error('تصویری در پاسخ گوگل دریافت نشد.');
  }

  return `data:image/jpeg;base64,${base64Image}`;
}
