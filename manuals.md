
# Honoバックエンドプロジェクトのセットアップ

```bash
mkdir backend
cd backend
bun init
```

# 必要なパッケージをインストールする

```bash
bun add hono prisma @prisma/client @supabase/supabase-js
```

# Prismaのセットアップ

```bash
bunx prisma init
```

prisma/schema.prismaを編集すること

# Prismaのマイグレーション

```bash
bunx prisma migrate dev --name init
```

# Prismaクライアントの生成

```bash
bunx prisma generate
```

# jestの導入

```bash
npm i ts-jest jest @types/jest @prisma/client --save-dev
npm i ts-node --save-dev
npm i supertest --save-dev
npm i @types/supertest --save-dev
```