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

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", pauseRecording);

function startRecording() {
	console.log("recordButton clicked");

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
	console.log("Antes del permiso");
	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

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

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUserMedia() fails
		console.log(err);
		console.log("No pidio permiso");
    	recordButton.disabled = false;
    	stopButton.disabled = true;
    	pauseButton.disabled = true;
	});
}

function pauseRecording(){
	console.log("pauseButton clicked rec.recording=",rec.recording );
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
	console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
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

function createDownloadLink(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');
	var text = document.createElement('div');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	text.innerHTML = '<input type="text" id="txtNombre" placeholder="Ingresa el nombre del archivo" class="textNombre" value="">';

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//save to disk link
	link.href = url;
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = '<i class="fa fa-upload"></i> Guardar';

	//add the new audio element to li
	li.appendChild(au);
	li.appendChild(text);
	//add the filename to the li
	//if(document.getElementById("txtNombre").value == ''){
		li.appendChild(document.createTextNode(filename+".wav "));
	//}else{
		//li.appendChild(document.createTextNode(document.getElementById("txtNombre").value+"a.wav "));
	//}

	//add the save to disk link to li
	li.appendChild(link);
	
	//upload link
	var upload = document.createElement('a');
	upload.href="#";
	upload.innerHTML = "Upload";
	upload.addEventListener("click", function(event){
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server returned: ",e.target.responseText);
		      }
		  };
		  var fd=new FormData();
		  fd.append("audio_data",blob, filename);
		  xhr.open("POST","upload.php",true);
		  xhr.send(fd);
	})
	li.appendChild(document.createTextNode (" "))//add a space in between
	li.appendChild(upload);//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);
}

function createDownloadButton(blob) {
	
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var text = document.createElement('div');

	//name of .wav file to use during upload and download (without extendion)
	var filename = new Date().toISOString();

	text.innerHTML = '<input type="text" id="txtNombre" placeholder="Ingresa el nombre del archivo" class="textNombre" value="">'+
					 '<input type="button" id="btnDescargar" value="<i class="fa fa-upload"></i> Guardar" onclick=uploadFile()>';

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	link.href = url;
	link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	link.innerHTML = '<i class="fa fa-upload"></i> Guardar';

	//add the new audio element to li
	li.appendChild(au);
	li.appendChild(text);
	//add the filename to the li
	//if(document.getElementById("txtNombre").value == ''){
		li.appendChild(document.createTextNode(filename+".wav "));
	//}else{
		//li.appendChild(document.createTextNode(document.getElementById("txtNombre").value+"a.wav "));
	//}

	//add the save to disk link to li
	li.appendChild(link);
	
	//upload link
	var upload = document.createElement('a');
	upload.href="#";
	upload.innerHTML = "Upload";
	upload.addEventListener("click", function(event){
		  var xhr=new XMLHttpRequest();
		  xhr.onload=function(e) {
		      if(this.readyState === 4) {
		          console.log("Server returned: ",e.target.responseText);
		      }
		  };
		  var fd=new FormData();
		  fd.append("audio_data",blob, filename);
		  xhr.open("POST","upload.php",true);
		  xhr.send(fd);
	})
	li.appendChild(document.createTextNode (" "))//add a space in between
	li.appendChild(upload);//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);
}