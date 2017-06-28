var fs = require("fs");
var Promise = require("bluebird");
var tinyliquid = require("tinyliquid");
var path = require("path");

const customTags = {
  yield: (context, name, body) => {
    console.log('YEILD: ', context, name, body);
    context.astStack.push(tinyliquid.parse('YEILDING CUSTOM CONTENT'));
  },
  form_for: (context, name, body) => {
    // console.log(context, name, body);
    context.astStack.push('Form For Custom');
  },
  hidden_field_tag: (context, name, body) => {
    // console.log(name, body);
    context.astStack.push('Hidden_field_tag');
  },
  error_messages_for: (context, name, body) => {
    // console.log(name, body);
    context.astStack.push('error_messages_for tag');
  },
  text_field: (context, name, body) => {
    // console.log(name, body);
    context.astStack.push('text_field tag');
  },
  check_box: (context, name, body) => {
    // console.log(name, body);
    context.astStack.push('check_box');
  },
  submit_tag: (context, name, body) => {
    // console.log(name, body);
    context.astStack.push('submit_tag');
  },
  endform_for: (context, name, body) => {
    // console.log(name, body);
    context.astStack.push('submit_tag');
  },
  icon: (context, name, body) => {
    // console.log(name, body);
    context.astStack.push('icon');
  }
}

var liquify = function(contents, locals, includeBase, prefix, filters){
  var template;
  var context = tinyliquid.newContext({
      locals: locals,
      filters: filters
    });

  console.log('contents: ', contents);
  if(!contents) {
    contents = '';
  };

  if(typeof contents !== "string"){
    template = contents;
  } else {
    template = tinyliquid.compile(contents, {customTags});
  }

  return new Promise(function (resolve, reject) {

    context.onInclude(function (name, callback) {

      var absolute = isAbsolute(name);
      var ext = path.extname(name);
      var filePath;
      var prefix = '_';

      if(!absolute) {

        if(prefix) {
          name = prefix + name;
          // console.log(name);
        }

        if(!ext) {
          name += ".html";
          // console.log(name);
        }

        filePath = path.join(includeBase, name);
        // console.log(filePath);

      } else {
        filePath = name;
        // console.log(name);
      }


      fs.readFile(filePath, 'utf8', (err, text) => {

        if (err) {
          reject(err);
          return callback(err);
        }
        // console.log(text);
        var ast = tinyliquid.parse(text);
        console.log(ast);
        callback(err, ast);
      });
    });

    template(context, (err) => {
      if (err) return reject('ERROR: ', err);
      resolve(context.getBuffer());
    });
  });

};

function isAbsolute(p) {
    if(path.isAbsolute) return path.isAbsolute(p);
    return path.normalize(p + '/') === path.normalize(path.resolve(p) + '/');
}

module.exports = liquify;
