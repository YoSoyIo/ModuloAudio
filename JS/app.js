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

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video:false };

 	/*
    	Disable the record button until we get a success or fail from getUserMedia() 
	*/

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = false;

	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		/*  assign to gumStream for later use  */
		gumStream = stream;
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input,{numChannels:1});

		//start the recording process
		rec.record();


	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true;
	});
}

function pauseRecording(){
	if (rec.recording){
		//pause
		rec.stop();
		pauseButton.innerHTML='<i class="fa fa-play"></i> Reanudar';
	}else{
		//resume
		rec.record()
		pauseButton.innerHTML='<i class="fa fa-pause"></i> Pause';

	}
}

function stopRecording() {
	stopButton.disabled = true;
	recordButton.disabled = false;
	pauseButton.disabled = true;

	//reset button just in case the recording is stopped while paused
	pauseButton.innerHTML='<i class="fa fa-pause"></i> Pause';
	
	//tell the recorder to stop the recording
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
	var etiqueta = document.getElementById("lbl-nombre");
	var nombre = texto.value;

	if(verificaCadena(nombre)){
		link.download = nombre+".wav";
		etiqueta.innerHTML = nombre+".wav";
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

	text.innerHTML = '<input type="text" id="txtNombre" onblur="cambiarNombre();" placeholder="'+filename+'.wav" class="textNombre" value="">'+
					 '<button id="btn-nombre" class="boton-multimedia" onclick="cambiarNombre();"><i class="fa fa-pencil-square-o"></i> Renombrar</button>';

	//add controls to the <audio> element
	au.controls = true;
	au.controlsList = "nodownload";
	au.src = url;

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
	//add the new audio element to li
	li.appendChild(au);
	li.appendChild(text);
	//add the filename to the li
	//if(document.getElementById("txtNombre").value == ''){
	var etiq = document.createElement("div");
	etiq.innerHTML="<p id='lbl-nombre'>"+filename+".wav</p>";
	li.appendChild(etiq);
	//}else{
		//li.appendChild(document.createTextNode(document.getElementById("txtNombre").value+"a.wav "));
	//}

	//add the save to disk link to li
	li.appendChild(link);
	
	//upload link
	var upload = document.createElement('a');
	upload.href="#";
	upload.className = "boton-audio";
	upload.innerHTML = '<i class="fa fa-upload"></i> Guardar';
	upload.addEventListener("click", function(event){
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
