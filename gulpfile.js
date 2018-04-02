'use strict'
const gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    glob = require('glob'),
    fs = require('fs');
	

	
var nameOfJS = 'mirket';

var sourceFile = 'src/',
    beginFile = 'begin.js',
    endFile = 'end.js';

var fileOrder = (opt) => {
    opt = opt || {};

    var paths = opt.paths || glob.sync(sourceFile + '**/*js' , {
                matchBase: true
        }),
		except = [sourceFile + beginFile , sourceFile + endFile],
        bytes = 30 * 25, // okunacak byte uzunluğu
        buffer = Buffer.alloc(bytes),
        readFile = (path) => {
			return fs.readFileSync(path);
            fs.readSync(fs.openSync(path , 'r') , buffer , 0 , bytes , 0);
            return buffer.toString();
        },
        regexp = new RegExp('^// require\:(.+)$' , 'mg'),
        findReq = function (file) {
            let list = [] ,
                match;
            regexp.lastIndex = 0;
            while ((match = regexp.exec(file)) != null) {
                list.push(match[1].replace('.' , '/') + '.js');
            }
            return list;
        },
        requirement = {},
        list = [],
        result = [],
        dive = (path) => {

            var req;
            if (req = requirement[path]) {
                if (req && req.length > 0) {
                    for (let val of req) {
                        if (list.indexOf(val) < 1) {
                            dive(val);
                        }
                    }
                }
            }
            if (list.indexOf(path) < 0) {
                list.push(path);
            }
        };
	
	
	for (let i = 0 ; i < except.length ; i++) {
		let index = paths.indexOf(except[i]);
		if (index !== -1) {
			paths.splice(index , 1);
		}
	}
		

    for (let path of paths) {
        requirement[path.slice(sourceFile.length)] = findReq(readFile(path));
    }

    for (let path in requirement) {
        dive(path);
    }

    result.push(sourceFile + beginFile);
    for (let val of list) {
        result.push(sourceFile + val);
    }
    result.push(sourceFile + endFile);

    console.log(result);
    return result;
};



gulp.task('full' ,  () => {
    return gulp.src(fileOrder())
    .pipe(concat(nameOfJS + '.js'))
    .pipe(gulp.dest('./build'))
    .pipe(uglify())
    .pipe(rename(nameOfJS + '.min.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('default' , () => {
    return gulp.src(fileOrder())
    .pipe(concat(nameOfJS + '.js'))
    .pipe(gulp.dest('./build'));
});

gulp.task('concat' , () => {
    return gulp.src(fileOrder())
        .pipe(concat(nameOfJS + '.js'))
        .pipe(gulp.dest('./build'))
        .pipe(connect.reload());
})


gulp.task('connect' , () => {
    connect.server({
        root: '',
        livereload: true
    });
});

gulp.task('watch' , () => {
    gulp.watch(sourceFile + '**/*.js' , ['concat']);
});

gulp.task('server' , ['connect' , 'watch']);