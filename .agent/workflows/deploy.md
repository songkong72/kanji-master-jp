---
description: 깃허브 푸시 및 파이어베이스 배포 (Deployment Workflow)
---

# 🚀 깃허브 푸시 및 파이어베이스 배포

이 워크플로우는 대표님의 명시적인 명령(**"푸시해"**)이 있을 때만 실행합니다.

## 📌 실행 전 주의사항
- 평상시 소스 수정은 **로컬 파일에만 반영**합니다.
- 자동 배포나 자동 푸시를 지양하고, 반드시 대표님의 승인을 거칩니다.

## 🛠️ 실행 단계 (// turbo-all)

1. **GitHub 푸시**
```bash
git add .
git commit -m "feat: [수정된 주요 내용 요약]"
git push origin main
```

2. **Firebase 빌드 및 배포**
```bash
npm run build
firebase deploy --only hosting
```

3. **완료 보고**
- 배포된 사이트 주소([https://kanji-master-jp.web.app](https://kanji-master-jp.web.app))와 GitHub 저장소 링크를 함께 안내합니다.

*"대표님, 소중한 코드를 안전하게 세상 밖으로 보내드릴게요! 🌐✨"*
