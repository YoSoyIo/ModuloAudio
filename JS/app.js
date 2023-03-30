//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("pauseButton");

//name of .wav file to use during upload and download (without extendion)
var filename;

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording() {

    var constraints = { audio: true, video:false };

	recordButton.className = "ocultar";
	pauseButton.className = "mostrar";

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		audioContext = new AudioContext();

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		rec = new Recorder(input,{numChannels:1});

		//start the recording process
		rec.record();


	}).catch(function(err) {
		recordButton.className = "mostrar";
		pauseButton.className = "ocultar";
	});
}

function pauseRecording(){
	if (rec.recording){
		//pause
		rec.stop();
		document.getElementById("icon-pausar").style.color = "black";
	}else{
		//resume
		rec.record()
		document.getElementById("icon-pausar").style.color = "red";

	}
}

function stopRecording() {
	recordButton.className = "mostrar";
	pauseButton.className = "ocultar";

	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
	//rec.exportWAV(createDownloadButton);
}

function getFileName(){
	try{
		return document.getElementById("txtNombre").value;
	}catch{
		return filename;
	}
}

function setFilename(elemento){
	filename = elemento.innerHTML;
}

function verificaCadena(cadena){
	if (cadena.length > 0) {
		console.log("Cumple");
		return true;
	} else {
		console.log("No Cumple");
		return false;
	}
}

function cambiarNombre(){
	var link = document.getElementById("btn-descarga");
	var texto = document.getElementById("txtNombre");
	//var etiqueta = document.getElementById("lbl-nombre");
	var nombre = texto.value;

	if(verificaCadena(nombre)){
		link.download = nombre+".wav";
		//etiqueta.innerHTML = nombre+".wav";
		texto.placeholder = nombre+".wav";
		texto.value = "";
	}
}

function createDownloadLink(blob) {
	
	try{
		let lista = document.getElementById("recordingsList");
		let borrar = document.getElementById("elemA");
		lista.removeChild(borrar);
	}catch{

	}

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');
	var text = document.createElement('div');
	var btnDelete = document.createElement('button');

	li.id = "elemA";

	filename  = new Date().toISOString();

	text.innerHTML = '<input type="text" id="txtNombre" onblur="cambiarNombre();" placeholder="'+filename+'.wav" class="textNombre" value="">';

	//add controls to the <audio> element
	au.controls = true;
	au.controlsList = "nodownload";
	au.src = url;
	au.innerHTML = "<b style='color: red;'>Este navegador no soporta la grabadora de audio</b>";

	//save to disk link
	link.href = url;
	link.id = "btn-descarga";
	link.className = "boton-audio";
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = '<i class="fa fa-download"></i> Descargar';

	btnDelete.addEventListener("click", function(event){
		let lista = document.getElementById("recordingsList");
		let borrar = document.getElementById("elemA");
		lista.removeChild(borrar);
	});

	btnDelete.innerHTML = '<i class="fa fa-window-close"></i> Quitar';
	btnDelete.className = "boton-borrar";

	li.appendChild(au);
	li.appendChild(text);
	//li.appendChild(link);
	
	//upload link
	var upload = document.createElement('a');
	upload.href="#";
	upload.className = "boton-audio";
	upload.innerHTML = '<i class="fa fa-upload"></i> Guardar';
	upload.addEventListener("click", function(event){
		  filename = document.getElementById("txtNombre").value+".wav";
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server returned: ",e.target.responseText);
		      }
		  };
		  var fd=new FormData();
		  console.log(filename);
		  fd.append("audio_data",blob, filename);
		  xhr.open("POST","upload.php",true);
		  xhr.send(fd);
	})
	li.appendChild(document.createTextNode (" "))//add a space in between
	li.appendChild(upload);//add the upload link to li
	li.appendChild(btnDelete);

	//add the li element to the ol
	recordingsList.appendChild(li);
}
