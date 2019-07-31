//YES I know element should be renamed to tile but its too late to go back now, I'm the only person dealing with this code

//init global variables
var controlState = 'drop',
	elements = [],
	brush = 1,
	simulationInterval = null;
const elevationLightness = [10, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80],
	landHue = 109,
	waterHue = 190,
	canv = document.getElementById("m'Canvas"),
	drop = document.getElementById("drop"),
	dig = document.getElementById("dig"),
	pour = document.getElementById("pour"),
	siphon = document.getElementById("siphon"),
	runSim = document.getElementById("run_sim"),
	endSim = document.getElementById("end_sim"),
	canvLeft = canv.offsetLeft,
	canvTop = canv.offsetTop,
	context = canv.getContext('2d'),
	trueTypeOf = function (obj) { //type checker for debugging
	return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
	};

//draw the elements on the board
const drawElements = () => {
	/*
		I know I could've used the index property in forEach; instead of adding an i & j value
		to the tile JSON. That, however, would make things much harder to read. Plus this program
		isn't very big, so adding 2 numbers to each element in a fat datastructure of JSON wouldn't make a big
		difference.
	*/
	elements.forEach(row => row.forEach(elem => { 
		if(elem.water > 0) { //if the tile is water
			context.fillStyle = `hsl(${waterHue}, 100%, ${elevationLightness[9 - elem.water]}%)`;
		}
		else { //if the tile is land
			context.fillStyle = `hsl(${landHue}, 100%, ${elevationLightness[elem.elevation]}%)`;
		}
		context.fillRect((elem.j * 10), (elem.i * 10), 10, 10); //x, -y, width, height
	}));
}

//reset board function, using (i, j) coordinate sytem from my GOL project; -y is i and x is j
const resetBoard = () => {
	elements = []; //clear elements
	for(let i = 0; i < 50; i++) { //add default elements, we're using a 500 x 500 canvas with 10px x 10px tiles
		let row = []
		for(let j = 0; j < 50; j++) {
			row.push({
				i: i,
				j: j,
				water: 0,
				elevation: 4
			})
		}
		elements.push(row);
	}
	drawElements(); //make that reset happen
}

//handles a click on the canvas
const clickHandlr = (i, j) => {
	let brushStroke = (down, land) => { //both params are booleans
		let iStroke = (i <= (50 - brush)) ? brush: (50 - i); //make sure we're editing tiles and not undefined
		let jStroke = (j <= (50 - brush)) ? brush: (50 - j);
		iStroke = Number(iStroke); //can convert itself to a string from accessing the DOM
		jStroke = Number(jStroke);
		for(let p = i; p < (i + iStroke); p++) {
			for(let q = j; q < (j + jStroke); q++) {
				let tile = elements[p][q]
				if (land) {
					if (down && (tile.elevation > 0)) {
						tile.elevation--;
					}
					else if (!down && (tile.elevation < 9)) {
						tile.elevation++;
					}
				}
				else {
					if (down && (tile.water > 0)) {
						tile.water--;
					}
					else if (!down && (tile.water < 9)) {
						tile.water++;
					}
				}
			}
		}
	}
	switch (controlState) {
		case 'drop':
			brushStroke(false, true); //down, land
			break;
		case 'dig':
			brushStroke(true, true);
			break;
		case 'pour':
			brushStroke(false, false);
			break;
		case 'siphon':
			brushStroke(true, false);
			break;
		default:
			alert(`controlState is invalid; ${controlState}`);
	}
	drawElements();
}

//called by the DOM to update the value of brush
const updatebrush = () => {
	brush = document.getElementById("brush").value;
	console.log(`brush width changed to ${brush}`);
}

const calculateNextState = () => {
	console.log('running sim');
	let newState = elements.map(row => {return row.slice()});
	elements.forEach(row => row.forEach(element => {
		if(element.water > 0) {
			let scanIStart = (element.i > 0) ? (element.i - 1): element.i; //we're scanning each adjacent tile
			let scanIEnd = (element.i < 49) ? (element.i + 1): element.i;
			let scanJStart = (element.j > 0) ? (element.j - 1): element.j;
			let scanJEnd = (element.j < 49) ? (element.j + 1): element.j;
			let lowestPoint = element;
			for (let i = scanIStart; i <= scanIEnd; i++) {
				for (let j = scanJStart; j <= scanJEnd; j++) {
					if((i != element.i) || (j != element.j)) {
						if(trueTypeOf(elements[i][j]) == 'undefined') console.log(`undefined! i: ${i}, j: ${j}`);
						let lowestWaterHeight = lowestPoint.water + lowestPoint.elevation;
						let neighborWaterHeight = elements[i][j].water + elements[i][j].elevation;
						if ((neighborWaterHeight < lowestWaterHeight) && ((lowestWaterHeight - neighborWaterHeight > 1) || (elements[i][j].water > 0)))  lowestPoint = elements[i][j];

					}
				}
			}
			newState[element.i][element.j].water--;
			newState[lowestPoint.i][lowestPoint.j].water++;
		}
	}));
	elements = newState;
	drawElements();
}

//add event listeners
drop.addEventListener('click', event => {
	controlState = 'drop';
});

dig.addEventListener('click', event => {
	controlState = 'dig';
});

pour.addEventListener('click', event => {
	controlState = 'pour';
});

siphon.addEventListener('click', event => {
	controlState = 'siphon';
});

runSim.addEventListener('click', event => {
	simulationInterval = setInterval(calculateNextState, 300);
});

endSim.addEventListener('click', event => {
	clearInterval(simulationInterval);
})

canv.addEventListener('click', event => {
	let jRaw = event.pageX - canvLeft;
	let iRaw = event.pageY - canvTop;
	clickHandlr(Math.floor(iRaw/10), Math.floor(jRaw/10));
});

resetBoard();