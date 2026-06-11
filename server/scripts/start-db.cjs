// Starts (and initializes if needed) a local embedded Postgres instance for development.
const EmbeddedPostgres = require('embedded-postgres').default
const path = require('path')

const dataDir = path.join(__dirname, '..', '.pgdata')

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: 'flowstate',
  password: 'flowstate',
  port: 5432,
  persistent: true,
})

async function main() {
  const fs = require('fs')
  const isNew = !fs.existsSync(path.join(dataDir, 'PG_VERSION'))

  if (isNew) {
    console.log('Initializing embedded Postgres data directory...')
    await pg.initialise()
  }

  await pg.start()
  console.log('Embedded Postgres started on port 5432')

  if (isNew) {
    await pg.createDatabase('flowstate')
    console.log('Created database "flowstate"')
  }

  // Keep process alive
  process.on('SIGINT', async () => {
    await pg.stop()
    process.exit(0)
  })
  process.on('SIGTERM', async () => {
    await pg.stop()
    process.exit(0)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
