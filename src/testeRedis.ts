/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

const redisUrl =
  'redis://default:EjoBjMqCxjlyToefcvJZBFRbWNmJovTM@shuttle.proxy.rlwy.net:49548';

console.log('🔌 Conectando ao Redis via Keyv...');
console.log('📡 URL:', redisUrl);

const keyvRedis = new KeyvRedis(redisUrl, {
  useUnlink: true,
  namespace: '',
  throwOnConnectError: true,
  connectionTimeout: 5000,
});

const keyv = new Keyv({
  store: keyvRedis,
  useKeyPrefix: false,
});

keyv.on('error', (error) => {
  console.error('❌ [Keyv Error]:', error);
});

async function test() {
  try {
    console.log('\n🧪 Iniciando testes...\n');

    // Teste 1: SET
    console.log('📝 Teste 1: Salvando dados...');
    const testKey = 'test-keyv-' + Date.now();
    await keyv.set(
      testKey,
      {
        message: 'teste keyv',
        timestamp: Date.now(),
      },
      60000,
    );
    console.log('✅ Salvou:', testKey);

    // Teste 2: GET
    console.log('\n📖 Teste 2: Lendo dados...');
    const value = await keyv.get(testKey);
    console.log('✅ Leu:', value);

    // Teste 3: Acessar client Redis diretamente (node-redis v4)
    console.log('\n🔍 Teste 3: Listando chaves no Redis...');
    const client = (keyvRedis as any).client;

    // PING
    const pong = await client.ping();
    console.log('🏓 PING:', pong);

    // KEYS *
    const keys = await client.keys('*');
    console.log('🔑 Total de chaves:', keys.length);
    console.log('🔑 Chaves encontradas:', keys);

    // DBSIZE
    const dbsize = await client.dbSize();
    console.log('📊 DBSIZE:', dbsize);

    // INFO
    const info = await client.info('keyspace');
    console.log('📊 INFO keyspace:', info);

    // Limpar teste
    // await keyv.delete(testKey);
    // console.log('\n🧹 Limpou chave de teste');

    console.log('\n✅ TODOS OS TESTES PASSARAM!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Inicia o teste
void test();
