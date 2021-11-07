const { promisify } = require('util')

module.exports.clone = async function (repo, desc) {
  const download = promisify(require('download-git-repo'))
  const ora = require('ora')
  const process = ora(`下载......${repo}中`)
  process.start()
  await download(repo, desc)
  process.succeed()
}
