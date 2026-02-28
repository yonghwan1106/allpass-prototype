// PII (개인식별정보) 탐지 및 마스킹

export interface PIIDetection {
  type: 'SSN' | 'PHONE' | 'NAME' | 'ADDRESS' | 'EMAIL' | 'ACCOUNT';
  value: string;
  start: number;
  end: number;
  token: string;
}

interface MaskResult {
  masked: string;
  tokens: Map<string, string>;
  detections: PIIDetection[];
}

const PII_PATTERNS: Array<{
  type: PIIDetection['type'];
  pattern: RegExp;
  label: string;
}> = [
  {
    type: 'SSN',
    pattern: /\d{6}-[1-4]\d{6}/g,
    label: '주민등록번호',
  },
  {
    type: 'SSN',
    pattern: /\d{6}-[1-4]X{6}/g,
    label: '주민등록번호',
  },
  {
    type: 'PHONE',
    pattern: /01[016789]-\d{3,4}-\d{4}/g,
    label: '전화번호',
  },
  {
    type: 'EMAIL',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    label: '이메일',
  },
  {
    type: 'ACCOUNT',
    pattern: /\d{3,4}-\d{2,4}-\d{4,6}/g,
    label: '계좌번호',
  },
];

// 한국 이름 패턴 (성+이름, 2~4자)
const KOREAN_NAME_PATTERN = /[가-힣]{2,4}(?=\s*[,씨님은이가의]|$)/g;
// 주소 패턴
const ADDRESS_PATTERN =
  /(?:[가-힣]+(?:특별시|광역시|시|도)\s+)?[가-힣]+(?:시|군|구)\s+[가-힣]+(?:읍|면|동|로|길)\s*[\d-]+(?:번지)?(?:\s*\d+층)?/g;

export function detectPII(text: string): PIIDetection[] {
  const detections: PIIDetection[] = [];
  let counter: Record<string, number> = {
    SSN: 0,
    PHONE: 0,
    NAME: 0,
    ADDRESS: 0,
    EMAIL: 0,
    ACCOUNT: 0,
  };

  // 정규식 패턴 매칭
  for (const { type, pattern } of PII_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      counter[type]++;
      detections.push({
        type,
        value: match[0],
        start: match.index,
        end: match.index + match[0].length,
        token: `[${type}_${counter[type]}]`,
      });
    }
  }

  // 주소 패턴
  {
    const regex = new RegExp(ADDRESS_PATTERN.source, ADDRESS_PATTERN.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const overlaps = detections.some(
        (d) => match!.index >= d.start && match!.index < d.end
      );
      if (!overlaps) {
        counter.ADDRESS++;
        detections.push({
          type: 'ADDRESS',
          value: match[0],
          start: match.index,
          end: match.index + match[0].length,
          token: `[ADDR_${counter.ADDRESS}]`,
        });
      }
    }
  }

  // 이름 패턴 (컨텍스트 기반)
  {
    const regex = new RegExp(KOREAN_NAME_PATTERN.source, KOREAN_NAME_PATTERN.flags);
    let match;
    while ((match = regex.exec(text)) !== null) {
      const overlaps = detections.some(
        (d) =>
          (match!.index >= d.start && match!.index < d.end) ||
          (match!.index + match![0].length > d.start &&
            match!.index + match![0].length <= d.end)
      );
      if (!overlaps && match[0].length <= 4) {
        counter.NAME++;
        detections.push({
          type: 'NAME',
          value: match[0],
          start: match.index,
          end: match.index + match[0].length,
          token: `[NAME_${counter.NAME}]`,
        });
      }
    }
  }

  return detections.sort((a, b) => a.start - b.start);
}

export function maskPII(text: string): MaskResult {
  const detections = detectPII(text);
  const tokens = new Map<string, string>();
  let masked = text;
  let offset = 0;

  for (const detection of detections) {
    const adjustedStart = detection.start + offset;
    const adjustedEnd = detection.end + offset;
    tokens.set(detection.token, detection.value);

    masked =
      masked.slice(0, adjustedStart) +
      detection.token +
      masked.slice(adjustedEnd);

    offset += detection.token.length - detection.value.length;
  }

  return { masked, tokens, detections };
}

export function unmaskPII(text: string, tokens: Map<string, string>): string {
  let result = text;
  for (const [token, value] of tokens) {
    result = result.replace(token, value);
  }
  return result;
}

export function getPIITypeLabel(type: PIIDetection['type']): string {
  const labels: Record<PIIDetection['type'], string> = {
    SSN: '주민등록번호',
    PHONE: '전화번호',
    NAME: '이름',
    ADDRESS: '주소',
    EMAIL: '이메일',
    ACCOUNT: '계좌번호',
  };
  return labels[type];
}
