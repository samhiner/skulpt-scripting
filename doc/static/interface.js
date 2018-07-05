// output functions are configurable.  This one just appends some text
// to a pre element.
function outf(text) {
	mypre.innerHTML += text;
}
function builtinRead(x) {
	if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
		throw "File not found: '" + x + "'";
	}
	return Sk.builtinFiles["files"][x];
}
function runScript(prog,output) {
	mypre = document.getElementById(output); 
	mypre.innerHTML = ''; 
	Sk.pre = output;
	Sk.configure({output:outf, read:builtinRead}); 
	(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
	var myPromise = Sk.misceval.asyncToPromise(function() {
		return Sk.importMainWithBody("<stdin>", false, prog, true);
	});
	myPromise.then(function(mod) {
		console.log('success');
	},
		function(err) {
		console.log(err.toString());
	});
}

function processOutput(outputScripts) {
	var script = '';
	console.log(outputScripts)
	for (var x = 0; x < outputScripts.length; x++) {
		scriptPart = outputScripts[x].innerHTML;
		var defIndent = firstChar(scriptPart,0,0);
		if (defIndent != null) {
			scriptPart = normalizeIndent(defIndent[1],scriptPart);
		}
		script += scriptPart;
	}
	console.log('Parsed Script: ' + script); //ISSUE: remove this at end of development if you still want to then
	return runScript(script,'cout');//output,canvas
} //ISSUE: add it so processScript is run once for every output (aka in text/python:hi the :hi part) and outputs to the right place
//ISSUE: for turtle could just do an optional |canvas (aka text/python:output|canvas)


function firstChar(string,position,defTabs,defSpaces) {
	if (['\n','	',' '].indexOf(string[position]) == -1) {
		if (defSpaces != 0 && defTabs == 0) {
			return ['s',defSpaces]; //ISSUE: don't need s/t anymore and could even not check diff between spaces and tabs.
		} else if (defTabs != 0 && defSpaces == 0) {
			return ['t',defTabs]; 
		} else if (defSpaces != 0 && defTabs != 0) {
			throw 'SyntaxError: Inconsistent use of tabs and spaces in indentation.';
		} else {
			return null;
		}

	} else if (string[position] == '	') {
		defTabs += 1;
	} else if (string[position] == ' ') {
		defSpaces += 1;
	} else if (string[position] == '\n') {
		defTabs = 0;
		defSpaces = 0;
	}
	return firstChar(string,position + 1,defTabs,defSpaces);
}

function normalizeIndent(indent,script) {
	var deleteNext = false;
	var newScript = '';
	var delChars = null;
	for (var x = 0; x < script.length; x++) {
		if (deleteNext) {
			if (delChars == null) {
				delChars = indent;
			} else if (delChars == 0) {
				delChars = null;
				deleteNext = false;
			} else {
				delChars -= 1;
			}
		}

		if (deleteNext == false || delChars == 0) {
			newScript += script[x];
		}

		if (script[x] == '\n' && script[x + 1] != '\n') {
			deleteNext = true;
		}
	}
	return newScript;
}

function processScripts() {
	var pyScripts = document.querySelectorAll("script[type^='application/python'], script[type^='text/python']");
	var outputBank = {};
	for (var x = 0; x < pyScripts.length; x++) {
		var output = pyScripts[x].type.split(':')[1];
		if (output == undefined) {
			output = 'output';
		}

		if (outputBank[output] == undefined) {
			outputBank[output] = [pyScripts[x]];
		} else {
			outputBank[output].push(pyScripts[x]);
		}
	}

	console.log(outputBank)

	for (var key in outputBank) {
		console.log(key)
		processOutput(outputBank[key]);
		break;//delete
	}

}

processScripts();