// var fs = require('fs')
// var exec = require('child_process').exec
// var series = require('async').series
// var semver = require('semver')
//
// function run (command) {
//   return function (next) {
//     console.log('>', command)
//     exec(command, next)
//   }
// }
//
// function section (message) {
//   return function (next) {
//     console.log()
//     console.log(message)
//     next()
//   }
// }
//
// function checkCleanWorkingTree (next) {
//   run('git status --porcelain')(function (error, output) {
//     if (error) return next(error)
//     if (output.trim().length > 0) return next(new Error('Cannot run the railcars with a dirty working tree'))
//     next()
//   })
// }
//
// function bumpStableVersion (next) {
//   var newVersion = getCurrentVersion().replace(/-beta.*$/, '')
//   run('npm version ' + newVersion)(next)
// }
//
// function bumpBetaVersion (next) {
//   var newVersion = getCurrentVersion().replace(/-dev$/, '-beta0')
//   run('npm version ' + newVersion)(next)
// }
//
// function bumpDevVersion (next) {
//   var newVersion = semver.inc(getCurrentVersion(), 'preminor', 'dev').replace(/\.0$/, '')
//   series([
//     run('npm --no-git-tag-version version ' + newVersion),
//     run('git commit -am "' + newVersion + '"')
//   ], next)
// }
//
// function finish (error) {
//   if (error) {
//     console.log('Error: ' + error.message)
//     process.exit(1)
//   }
//
//   console.log('OK, now just wait for all CI builds to pass on beta and stable')
// }
//
// function getCurrentVersion () {
//   return JSON.parse(fs.readFileSync(require.resolve('../package.json'))).version
// }
//
// series([
//   section('Preparing to roll the railcars'),
//   checkCleanWorkingTree,
//   run('git checkout master'),
//   run('git pull --ff-only origin master'),
//   run('git fetch origin beta:beta stable:stable'),
//   run('git fetch origin --tags'),
//
//   section('Checking that merges will be fast-forwards'),
//   run('git branch --contains beta | grep master'),
//   run('git branch --contains stable | grep beta'),
//
//   section('Updating stable branch'),
//   run('git checkout stable'),
//   run('git merge --ff-only origin/beta'),
//   bumpStableVersion,
//
//   section('Updating beta branch'),
//   run('git checkout beta'),
//   run('git merge --ff-only origin/master'),
//   run('git merge --strategy ours origin/stable'),
//   bumpBetaVersion,
//
//   section('Updating master branch'),
//   run('git checkout master'),
//   run('git merge --ff-only origin/master'),
//   run('git merge --strategy ours origin/beta'),
//   bumpDevVersion,
//
//   section('Pushing changes upstream'),
//   run('git push origin master:master beta:beta stable:stable'),
//   run('git push origin --tags')
// ], finish)
