//webkitURL ya no se usa pero nunca esta de más
URL = window.URL || window.webkitURL;

let gumStream; //stream de getUserMedia()
let rec; //Recorder.js - Objeto
let input; //MediaStreamAudioSourceNode de donde se grabará

// shim for AudioContext when it's not avb.
let AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext; //audio context to help us record

let recordButton = document.getElementById("recordButton");
let stopButton = document.getElementById("stopButton");
let pauseButton = document.getElementById("pauseButton");

let tiempoT;

//name of .wav file to use during upload and download (without extendion)
let filename;

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

// Función para grabar el audio
function startRecording() {
	let constraints = { audio: true, video: false };

	recordButton.className = "ocultar";
	pauseButton.className = "mostrar";

	navigator.mediaDevices
		.getUserMedia(constraints)
		.then(function (stream) {
			audioContext = new AudioContext();

			gumStream = stream;
			input = audioContext.createMediaStreamSource(stream);

			rec = new Recorder(input, { numChannels: 1 });

			rec.record();
		})
		.catch(function (err) {
			recordButton.className = "mostrar";
			pauseButton.className = "ocultar";
		});
}

// Función para pausar la grabación

function pauseRecording() {
	if (rec.recording) {
		//pause
		rec.stop();
		document.getElementById("icon-pausar").style.color = "black";
	} else {
		//resume
		rec.record();
		document.getElementById("icon-pausar").style.color = "red";
	}
}

// Función para detener la grabación tambien inicia la creación del audio

function stopRecording() {
	recordButton.className = "mostrar";
	pauseButton.className = "ocultar";

	rec.stop();

	gumStream.getAudioTracks()[0].stop();

	// En esta parte se llama la función de creación de lo más importante
	try{
		let lista = document.getElementById("recordingsList");
		let borrar2 = document.getElementById("previaList");
		lista.removeChild(borrar2);
	}catch{}

	rec.exportWAV(createDownloadLink);
}

function getFileName() {
	try {
		return document.getElementById("txtNombre").value;
	} catch {
		return filename;
	}
}

function setFilename(elemento) {
	filename = elemento.innerHTML;
}

function quitaAcentos(str) {
	const acentos = "ÁáÉéÍíÓóÚúÜüÑñ";
	const equivalente = "AaEeIiOoUuUuNn";
	const regex = new RegExp(`[${acentos}]`, "g");
	return str.replace(regex, match => equivalente[acentos.indexOf(match)]);
  }
function espacios(str) {
	const regex = /\s+/g;
	return str.replace(regex, '_');
}

function caracEspeciales(str) {
	const regex = /[&\/\\#,+()$~%.'":*?<>{}\[\]]/g;
	return str.replace(regex, '');
  }

function verificaCadena(cadena) {
	if (cadena.length > 0) {
		console.log("Cumple");
		return true;
	} else {
		console.log("No Cumple");
		return false;
	}
}

function updateVolume() {
	const volume = document.getElementById("sliderV");
    const audio = document.querySelector('audio');

	audio.volume = volume.value;

  }

function cambiarNombre() {
	let link = document.getElementById("btn-descarga");
	let texto = document.getElementById("txtNombre");
	//let etiqueta = document.getElementById("lbl-nombre");
	let nombre = texto.value;

	if (verificaCadena(nombre)) {
		link.download = nombre + ".wav";
		//etiqueta.innerHTML = nombre+".wav";
		texto.placeholder = nombre + ".wav";
		texto.value = "";
	}
}

function formatTime(seconds) {
	var minutes = Math.floor(seconds / 60);
	var seconds = Math.floor(seconds % 60);
	var formattedTime = minutes.toString().padStart(1, "0") + ":" + seconds.toString().padStart(2, "0");
	return formattedTime;
  }

function createDownloadLink(blob) {
	try {
		let lista = document.getElementById("recordingsList");
		let borrar = document.getElementById("elemA");
		lista.removeChild(borrar);
	} catch { }

	let url = URL.createObjectURL(blob);
	let au = document.createElement("audio");
	let li = document.createElement("div");
	let link = document.createElement("a");
	let text = document.createElement("div");
	let btnDelete = document.createElement("button");
	let btnPlay = document.createElement("button");
	let btnPause = document.createElement("button");
	let rgDuration = document.createElement("input");
	let time = document.createElement("p");
	let contCajaV = document.createElement("div");
	let volumen = document.createElement("input");
	let iconV = document.createElement("i");
	
	li.id = "elemA";

	filename = new Date().toISOString();

	text.innerHTML =
		'<input type="text" id="txtNombre" placeholder="Ingresa el nombre del archivo..." class="textNombre" value="">';

	//add controls to the <audio> element
	au.controls = true;
	au.controlsList = "nodownload";
	au.src = url;
	au.id = "audio1";
	au.className = "ocultar";
	au.innerHTML =
		"<b style='color: red;'>Este navegador no soporta la grabadora de audio</b>";

	//save to disk link
	link.href = url;
	link.id = "btn-descarga";

	btnDelete.addEventListener("click", function (event) {
		let lista = document.getElementById("recordingsList");
		let borrar = document.getElementById("elemA");
		lista.removeChild(borrar);
	});

	btnDelete.innerHTML = '<i class="fa fa-trash"></i> Quitar';
	btnDelete.className = "boton-borrar";

	btnPlay.addEventListener("click", function (event) {
		let audio = document.getElementById("audio1");
		let audioBar = document.getElementById("audioBar");
		let time = document.getElementById("time1");

		audioBar.max = "100";
		audioBar.min = "0";

		audio.addEventListener('timeupdate', function() {
			audioBar.value = (audio.currentTime / audio.duration) * 100;
			var currentTimeFormatted = formatTime(audio.currentTime);
			var durationFormatted = formatTime(audio.duration);
			time.innerHTML = currentTimeFormatted + "/" + durationFormatted;
			if(audio.currentTime / audio.duration == 1){
			  btnPlay.className = "boton-play mostrar";
			  btnPause.className = "boton-pause ocultar";
			}
		  });
		  
		  audioBar.addEventListener('input', function() {
			audio.currentTime = (audioBar.value / 100) * audio.duration;
			var currentTimeFormatted = formatTime(audio.currentTime);
			var durationFormatted = formatTime(audio.duration);
			time.innerHTML = currentTimeFormatted + "/" + durationFormatted;
		  });

		btnPlay.className = "boton-play ocultar";
		btnPause.className = "boton-pause mostrar";
		audio.play();
	});

	btnPlay.innerHTML = '<i class="fa fa-play-circle-o"></i>';
	btnPlay.className = "boton-play mostrar";

	btnPause.addEventListener("click", function (event) {
		let audio = document.getElementById("audio1");

		btnPlay.className = "boton-play mostrar";
		btnPause.className = "boton-pause ocultar";

		audio.pause();
	});

	btnPause.innerHTML = '<i class="fa fa-pause-circle-o"></i>';
	btnPause.className = "boton-pause ocultar";

	time.id = "time1";
	time.innerHTML = "0:00/0:00";

	rgDuration.type = "range";
	rgDuration.value = "0";
	rgDuration.id = "audioBar";

	contCajaV.className = "cajaVol";
	contCajaV.id = "cajaVol";

	volumen.type = "range";
	volumen.id = "sliderV";
	volumen.min = "0";
	volumen.max = "1";
	volumen.step = "0.01";
	volumen.value = "1";
	volumen.addEventListener("input", updateVolume);

	iconV.className = "fa fa-volume-up";
	iconV.id = "iconV";

	li.appendChild(au);
	li.appendChild(btnPlay);
	li.appendChild(btnPause);
	li.appendChild(rgDuration);
	li.appendChild(time);
	contCajaV.appendChild(volumen);
	contCajaV.appendChild(iconV);
	li.appendChild(contCajaV);
	li.appendChild(text);

	//upload link
	let upload = document.createElement("a");
	upload.href = "#";
	upload.className = "boton-audio";
	upload.innerHTML = "Guardar";
	upload.addEventListener("click", function (event) {
		let ahora = new Date();
		let enlanceLista = document.createElement("li");
		let lista = document.getElementById("recordingsList");
		let borrar2 = document.getElementById("elemA");

		let contenedor1 = document.getElementById("contenedorAudio");
		let contenedor2 = document.getElementById("controls");

		contenedor1.removeChild(contenedor2);

		if (verificaCadena(document.getElementById("txtNombre").value)) {
			filename = quitaAcentos(document.getElementById("txtNombre").value);
			filename = espacios(filename);
			filename = caracEspeciales(filename);
			filename = filename + ".wav";
		} else {
			filename = ahora.toDateString();
			filename = espacios(filename);
			filename = caracEspeciales(filename);
			filename = filename + ".wav";
		}

		link.download = filename;
		link.innerHTML = filename +
			"<p class='fechaNota'> - (" +
			ahora.toLocaleString() +
			")  </p>" + '<i class="fa fa-download"></i>';
		enlanceLista.appendChild(link);
		lista.removeChild(borrar2);
		lista.appendChild(enlanceLista);

		let xhr = new XMLHttpRequest();
		xhr.onload = function (e) {
			if (this.readyState === 4) {
				console.log("Server returned: ", e.target.responseText);
			}
		};
		let fd = new FormData();
		fd.append("audio", blob, filename);
		xhr.open("POST", "/ModuloAudio/PHP/upload.php", true);
		xhr.send(fd);
	});
	li.appendChild(document.createTextNode(" ")); //add a space in between
	li.appendChild(upload); //add the upload link to li
	li.appendChild(btnDelete);

	recordingsList.appendChild(li);
}
