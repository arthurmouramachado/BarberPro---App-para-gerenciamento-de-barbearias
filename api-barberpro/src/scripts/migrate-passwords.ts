/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import * as bcrypt from 'bcrypt';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function migratePasswords() {
  console.log('🔄 Iniciando migração de senhas...\n');

  const users = await prisma.usuarios.findMany();

  console.log(`📊 Encontrados ${users.length} usuários\n`);

  let countMigrated = 0;
  let countSkipped = 0;

  for (const user of users) {
    if (!user.senha || user.senha.startsWith('$2b$')) {
      console.log(
        `⏭️  ${user.email}: ja esta criptografada ou vazia, pulando...`,
      );
      countSkipped++;
      continue;
    }

    const hashedPassword = await bcrypt.hash(user.senha, 10);

    await prisma.usuarios.update({
      where: { id: user.id },
      data: { senha: hashedPassword },
    });

    console.log(`✅ ${user.email}: senha criptografada com sucesso!`);
    countMigrated++;
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 RESUMO DA MIGRAÇÃO:');
  console.log(`   ✅ Migradas: ${countMigrated} senhas`);
  console.log(`   ⏭️  Puladas (já criptografadas): ${countSkipped}`);
  console.log(`   📊 Total: ${users.length} usuários`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎉 Migração concluída com sucesso!');

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  await pool.end();
}

migratePasswords().catch((e) => {
  console.error('❌ Erro na migração:', e);
  process.exit(1);
});
