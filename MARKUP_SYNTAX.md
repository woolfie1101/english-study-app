# 텍스트 마크업 문법 가이드

Grammar와 Word 카테고리에서 텍스트 강조를 위한 마크업 문법 가이드입니다.

## 📝 마크업 문법

### 기본 규칙
```
{색상코드:강조할 텍스트}
```

### 지원 색상

| 코드 | 색상 | CSS 클래스 | 용도 |
|------|------|------------|------|
| `r` | 빨강 (Red) | `text-red-600` | 중요한 포인트, 주의사항 |
| `b` | 파랑 (Blue) | `text-blue-600` | 핵심 개념, 정의 |
| `g` | 초록 (Green) | `text-green-600` | 긍정적인 예시, 올바른 용법 |
| `y` | 노랑 (Yellow) | `text-yellow-600` | 예외 사항, 특별 규칙 |
| `p` | 보라 (Purple) | `text-purple-600` | 추가 정보, 팁 |

---

## 💡 Google Sheets 사용 예시

### 예시 1: Grammar - 전치사
```
session_number | section_number | section_title | concept | explanation | example_en
1 | 2 | 시간 전치사 | at | 특정 시점에 사용 {r:(시계에 점 찍기!)} - 24시간 보다 짧 | at 3 O'clock
1 | 2 | 시간 전치사 | on | 날짜, 요일, 기념일 {r:(달력에 O 표시!)} - 24시간 | on Monday
1 | 2 | 시간 전치사 | in | 주, 월, 연도 {r:(하루 이상의 긴 시간)} - 24시간 보다 긴 | in May
```

### 예시 2: 예외 사항 표시
```
explanation: 주, 월, 연도 {r:(하루 이상의 긴 시간)} - 24시간 보다 긴
note: {y:(예외: morning, evening, afternoon은 in을 쓴다)}
```

### 예시 3: 다중 색상 사용
```
explanation: {b:since}는 {r:특정한 과거 시점}부터 지금까지 이어짐 {g:("언제부터?")}
```

---

## 🎨 실제 화면 표시 예시

### Google Sheets 입력:
```
특정 시점에 사용 {r:(시계에 점 찍기!)} - 24시간 보다 짧
```

### 화면 출력:
특정 시점에 사용 **(시계에 점 찍기!)** - 24시간 보다 짧
↑ 이 부분이 빨간색 + 굵게 표시됨

---

## 🔧 UI 구현 방법

### React 컴포넌트 (StyledText)

```typescript
// components/StyledText.tsx
interface StyledTextProps {
  text: string;
}

export function StyledText({ text }: StyledTextProps) {
  const parseText = (input: string) => {
    const regex = /\{([rbgyp]):([^}]+)\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(input)) !== null) {
      // 매치 전 일반 텍스트
      if (match.index > lastIndex) {
        parts.push({
          text: input.substring(lastIndex, match.index),
          color: null
        });
      }

      // 색상이 있는 텍스트
      const colorCode = match[1];
      const text = match[2];
      const colorMap: Record<string, string> = {
        'r': 'text-red-600',
        'b': 'text-blue-600',
        'g': 'text-green-600',
        'y': 'text-yellow-600',
        'p': 'text-purple-600'
      };

      parts.push({
        text,
        color: colorMap[colorCode] || null
      });

      lastIndex = regex.lastIndex;
    }

    // 마지막 남은 텍스트
    if (lastIndex < input.length) {
      parts.push({
        text: input.substring(lastIndex),
        color: null
      });
    }

    return parts;
  };

  const parts = parseText(text);

  return (
    <span>
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.color ? `${part.color} font-semibold` : ''}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
}
```

### 사용 방법

```tsx
import { StyledText } from '@/components/StyledText';

// Grammar 화면에서 사용
<div className="text-sm text-gray-700">
  <StyledText text={concept.explanation} />
</div>
```

---

## 🚀 향후 확장 가능성

### 추가 스타일 옵션
```
{*:굵은 텍스트}         → font-bold
{_:밑줄 텍스트}         → underline
{!:노란 하이라이트}     → bg-yellow-200
{~:취소선}             → line-through
```

### 중첩 스타일 (미래)
```
{r:{*:빨간색이면서 굵은 텍스트}}
```

---

## 📌 주의사항

1. **중괄호 이스케이프**
   - 일반 중괄호를 사용하려면: `\{` 또는 `\}`
   - 예: `\{example\}` → `{example}` (마크업 아님)

2. **색상 코드 대소문자**
   - 소문자만 사용: `{r:텍스트}` ✅
   - 대문자 사용 불가: `{R:텍스트}` ❌

3. **중괄호 닫기 필수**
   - `{r:텍스트}` ✅
   - `{r:텍스트` ❌ (닫는 중괄호 누락)

4. **특수문자 포함 가능**
   - `{r:(시계에 점 찍기!)}` ✅
   - `{b:"언제부터?"}` ✅

---

## 📚 실제 데이터 예시 (전치사)

```
session_number: 1
section_number: 1
section_title: 전치사란?
concept: 정의
explanation: 명사의 앞에 나와서 시간, 장소, 방향 등등 {b:'어떤 관계'}에 대해 설명하는 말
example_en: The vase is on the table.
example_ko: 장소

---

session_number: 1
section_number: 2
section_title: 시간 전치사
subsection: 2-1
concept: at
explanation: 특정 시점에 사용 {r:(시계에 점 찍기!)} - 24시간 보다 짧
example_en: at 3 O'clock. at noon.
example_ko: NULL

---

session_number: 1
section_number: 2
section_title: 시간 전치사
subsection: 2-1
concept: on
explanation: 날짜, 요일, 기념일 {r:(달력에 O 표시!)} - 24시간
example_en: on Monday, on May 6th.
example_ko: NULL

---

session_number: 1
section_number: 2
section_title: 시간 전치사
subsection: 2-1
concept: in
explanation: 주, 월, 연도 {r:(하루 이상의 긴 시간)} - 24시간 보다 긴
example_en: in May, in 2025, in this week.
example_ko: NULL
note: {y:(예외: morning, evening, afternoon은 in을 쓴다)}
```

---

## 🎯 색상 사용 가이드라인

### 빨강 (r) - 가장 중요한 포인트
- 핵심 개념의 직관적인 설명
- 예: `{r:(시계에 점 찍기!)}`

### 파랑 (b) - 정의와 핵심 용어
- 문법 용어, 정의
- 예: `{b:전치사}는 명사의 앞에...`

### 초록 (g) - 긍정적인 예시
- 올바른 사용법
- 예: `{g:("언제부터?")}`

### 노랑 (y) - 예외와 주의사항
- 예외 규칙
- 예: `{y:(예외: morning은 in을 쓴다)}`

### 보라 (p) - 추가 팁
- 보충 설명
- 예: `{p:(Tip: 시간 표현에서는 항상 전치사를 확인하세요)}`

---

## 📝 작성 팁

1. **과도한 사용 금지**: 한 문장에 1-2개의 강조만 사용
2. **일관성 유지**: 같은 종류의 정보에는 같은 색상 사용
3. **가독성 우선**: 강조가 너무 많으면 오히려 집중력 저하
4. **괄호 활용**: 강조 텍스트를 괄호로 감싸면 더 명확함
   - 예: `{r:(핵심 포인트)}`

---

## 버전 히스토리

- **v1.0** (2025-01-13): 초기 문법 정의
  - 5가지 색상 지원 (r, b, g, y, p)
  - 기본 파싱 규칙 수립
