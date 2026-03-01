# 💮 Kanji Master JP - 일본어 한자 학습 앱

JLPT 상급 한자부터 기초 한자까지 단계별로 학습할 수 있는 인터랙티브한 한자 학습 서비스입니다.

## 📊 데이터 품질 및 보강 지침 (Data Enrichment Guidelines)

이 프로젝트의 한자 데이터 (`src/data/kanjiData.json`)를 추가하거나 수정할 때는 다음의 고품질 데이터 표준을 준수해야 합니다.

1. **발음별 정밀 예문 (Pronunciation-Specific Examples)**:
   - 한자의 **음독(On'yomi)**과 **훈독(Kun'yomi)** 각각에 대해 최소 하나 이상의 단어와 예문을 반드시 포함해야 합니다.
   - 학습자가 각 발음의 실질적인 쓰임새를 문장 속에서 이해할 수 있도록 구성합니다.

2. **실제 사용 빈도 및 JLPT 수준 (Practical & JLPT Frequency)**:
   - JLPT 수준(N5~N1)에 적합하면서도, 실제 일본 생활이나 시험에서 빈번하게 사용되는 단어와 문맥을 우선적으로 선택합니다.

3. **쌍방향 한자 버튼 형식**:
   - 예문에 한자가 포함될 경우 `[한자](발음)` 형식을 사용하여 앱 내에서 해당 한자 상세 페이지로 이동할 수 있도록 구성합니다.

4. **데이터 무결성**:
   - `id`는 고유해야 하며, `reading`은 히라가나로 통일하여 작성합니다.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
