const router = require('express').Router()
const db = require('../database/db')
const check = require('../lib/form-check')
const {PROBLEM_PATH, TEMP_PATH} = require('../config/basic')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, TEMP_PATH)
    },
    filename: (req, file, cb) => {
      cb(null, md5(file.fieldname + '-' + Date.now()) + '.md')
    }
  }),
  fileSize: '204800',
  files: 1
})

const TYPE_PARTIAL_CONTENT = 0

router.post('/add', async (req, res, next) => {

  // basic information
  const body = req.body
  const keys = ['title', 'cases', 'time_limit', 'memory_limit', 'type', 'special_judge', 'detail_judge', 'tags', 'level']
  const values = [body.title, body.cases, body.time_limit, body.memory_limit, body.type, body.special_judge, body.detail_judge, body.tags, body.level]

  const rules = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, {empty: 'remove'}, {empty: 'remove'}]
  req.form = {}
  const ret = check(keys, values, rules, req.form)
  if (ret) return res.fail(1, ret)
  return next()
})

router.post('/add', async (req, res) => {
  'use strict'
  // noinspection EqualityComparisonWithCoercionJS
  if (req.form.type != TYPE_PARTIAL_CONTENT) return next()
  const keys = ['description', 'input', 'output', 'sample_input', 'sample_output', 'hint']
  const values = [req.body.description, req.body.input, req.body.output, req.body.sample_input, req.body.sample_output, req.body.hint]
  const rules = undefined
  const form = req.form

  const ret = check(keys, values, rules, form)
  if (ret) return res.fail(1, ret)

  let tags = []
  let pid
  try {
    if (req.form.tags) {
      const t = JSON.parse(form.tags)
      const r = await db.query('select insert_tags($1) as tags', [t])
      if (r.rows.length) {
        tags = r.rows[0].tags
      }
    }

    const r = await db.query('insert into problems (title, restriction_id, cases, special_judge, detail_judge, level)' +
      ' values ($1, NULL, $2, $3::boolean, $4::boolean, $5::integer) returning problem_id', [form.title, form.cases, form.special_judge, form.detail_judge, form.level])
    if (r.rows.length !== 1) return res.fail(520, 'database returns neither an error nor a successful insert')

    pid = r.rows[0].problem_id
    for (let tag in tags) {
      if (!tags.hasOwnProperty(tag)) continue
      await db.query('INSERT INTO problem_tag_assoc(problem_id, tag_id, official) VALUES ($1, $2, TRUE)', [pid, tags[tag]])
    }

  } catch (e) {
    return res.fail(520, e)
  }

  const filename = `${pid}.md`
  const content = `## $$description$$

${form.description}

## $$input$$

${form.input}

## $$output$$

${form.output}

## $$sample_input$$

<pre>${form.sample_input}</pre>

## $$sample_output$$

<pre>${form.sample_output}</pre>

## $$hint$$

${form.hint}
`
  fs.writeFileSync(path.resolve(PROBLEM_PATH, filename), content)

  res.ok({problem_id: pid, filename: filename, content: content})
})

router.post('/update/:pid', (req, res, next) => {
  // basic information
  const body = req.body
  const keys = ['pid', 'title', 'cases', 'time_limit', 'memory_limit', 'type', 'special_judge', 'detail_judge', 'tags', 'level']
  const values = [req.params.pid, body.title, body.cases, body.time_limit, body.memory_limit, body.type, body.special_judge, body.detail_judge, body.tags, body.level]
  const rule = {empty: 'remove'}
  const rules = [rule, rule, rule, rule, rule, rule, rule, rule, rule, rule, rule]
  req.form = {}
  const ret = check(keys, values, rules, req.form)
  if (ret) return res.fail(1, ret)
  return next()
})

router.post('/update/:pid', async (req, res, next) => {

  const form = req.form
  // noinspection EqualityComparisonWithCoercionJS
  if (req.form.type == TYPE_PARTIAL_CONTENT) {
    const keys = ['description', 'input', 'output', 'sample_input', 'sample_output', 'hint']
    const values = [req.body.description, req.body.input, req.body.output, req.body.sample_input, req.body.sample_output, req.body.hint]
    const rules = undefined

    const ret = check(keys, values, rules, form)
    if (ret) return res.fail(1, ret)
  }
  let tags = []
  let pid = Number(form.pid)
  try {
    if (req.form.tags) {
      const t = JSON.parse(form.tags)
      const r = await db.query('select insert_tags($1) as tags', [t])
      if (r.rows.length) {
        tags = r.rows[0].tags
      }
      await db.query('DELETE FROM problem_tag_assoc WHERE problem_id = $1', [pid])
    }

    const r = await db.query('update problems set title = COALESCE($1, title), cases = COALESCE($2, cases),' +
      ' special_judge = COALESCE($3::boolean, special_judge), detail_judge = COALESCE($4::boolean, detail_judge),' +
      ' level = COALESCE($5::integer, level) where problem_id = $6 returning problem_id'
      , [form.title, form.cases, form.special_judge, form.detail_judge, form.level, pid])
    if (r.rows.length !== 1) return res.fail(520, 'database returns neither an error nor a successful insert')

    for (let tag in tags) {
      if (!tags.hasOwnProperty(tag)) continue
      await db.query('INSERT INTO problem_tag_assoc(problem_id, tag_id, official) VALUES ($1, $2, TRUE)', [pid, tags[tag]])
    }

  } catch (e) {
    return res.fail(520, e)
  }

  // noinspection EqualityComparisonWithCoercionJS
  if (req.form.type != TYPE_PARTIAL_CONTENT)
    return res.ok({problem_id: pid})

  const filename = `${pid}.md`
  const content = `## $$description$$

${form.description}

## $$input$$

${form.input}

## $$output$$

${form.output}

## $$sample_input$$

<pre>${form.sample_input}</pre>

## $$sample_output$$

<pre>${form.sample_output}</pre>

## $$hint$$

${form.hint}
`
  fs.writeFileSync(path.resolve(PROBLEM_PATH, filename), content)

  res.ok({problem_id: pid, filename: filename, content: content})
})


module.exports = router
