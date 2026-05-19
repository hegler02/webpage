# Mirinae Pages Project

Vercel 자동 배포용 정적 HTML 프로젝트입니다.

## 현재 포함된 페이지

- `/pages/sarang-49/` : 사랑아 잘 가 · The Mirinaeman Project

## GitHub 업로드 방식

ZIP을 푼 뒤, 아래 파일/폴더가 GitHub 저장소 루트에 보이도록 업로드하세요.

```text
vercel.json
README.md
pages/
  sarang-49/
    index.html
```

## 새 페이지 추가 방식

다음부터는 전체를 다시 덮어쓰지 말고 아래처럼 새 폴더만 추가하면 됩니다.

```text
pages/
  새페이지명/
    index.html
```

예시 주소:

```text
https://프로젝트명.vercel.app/pages/sarang-49/
https://프로젝트명.vercel.app/pages/새페이지명/
```

## 루트 주소 처리

`vercel.json`의 rewrite 설정으로 `/` 접속 시 현재 대표 페이지인 `/pages/sarang-49/`로 보여지게 했습니다.
대표 페이지를 바꾸려면 `vercel.json`의 destination 값을 새 페이지 경로로 바꾸면 됩니다.
