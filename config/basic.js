const path = require('path')
const {
    DIST_PATH, PUBLIC_PATH, TEMP_PATH, PROBLEM_SPJ_PATH,
    AVATAR_PATH, CONTEST_PATH, DATA_BASE,
    PROBLEM_DATA_PATH, PROBLEM_PATH, SOLUTION_PATH, FRONT_END_PATH, PICTURE,VIDEO
} = require('./path')

module.exports = {
    DATA_BASE: DATA_BASE,
    PICTURE_PATH: path.resolve(PICTURE),
    VIDEO_PATH: path.resolve(VIDEO),
    AVATAR_PATH: path.resolve(DATA_BASE, AVATAR_PATH),
    DIST_PATH: path.resolve(DATA_BASE, DIST_PATH),
    PROBLEM_PATH: path.resolve(DATA_BASE, PROBLEM_PATH),
    PROBLEM_DATA_PATH: path.resolve(DATA_BASE, PROBLEM_DATA_PATH),
    PROBLEM_SPJ_PATH: path.resolve(DATA_BASE, PROBLEM_SPJ_PATH),
    PUBLIC_PATH: path.resolve(DATA_BASE, PUBLIC_PATH),
    TEMP_PATH: path.resolve(DATA_BASE, TEMP_PATH),
    CONTEST_PATH: path.resolve(DATA_BASE, CONTEST_PATH),
    SOLUTION_PATH: path.resolve(DATA_BASE, SOLUTION_PATH),
    FRONT_END_PATH: path.resolve(DATA_BASE, FRONT_END_PATH),
    BACK_END_PATH: path.resolve(__dirname, '..')
}
