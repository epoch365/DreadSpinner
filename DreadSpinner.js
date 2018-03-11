// Instantiate a new vertical sprite
function verticalSprite (options) {
                
    var that = {},
     tickCount = 0,
     currentPos = 0,
     pixelsPerKeyFrame = 1,
     desiredPixelsPerKeyFrame = 1,
     stopAtNextFrame = -1,
     frameStepSize = 0,
     frameCount = 0;
     
    that.run = false;
    that.id = options.id;
    
    // The canvas context
    that.context = options.canvas.getContext("2d");
    
    // The sprite's/frame width
    that.width = options.canvas.width;
    
    // The frame height
    that.frameHeight = options.canvas.height;
    
    // The number of frames before restarting the animation
    that.numberOfFrames = options.numberOfFrames || 1;
    
    // The total height of the sprite
    that.height = that.numberOfFrames * that.frameHeight;
    
    // The sprite image
    that.image = options.image;
    
    // The number of ticks per frame (frame delay)
    that.ticksPerKeyFrame = options.ticksPerKeyFrame || 0;
    
    // The number of pixels to move the sprite per key frame
    that.pixelsPerKeyFrame = options.pixelsPerKeyFrame || 0;
    
    // The animation direction ("forward" or "reverse")
    that.direction = options.direction;
    
    // The start position
    that.startPos = options.startFrame * that.frameHeight;
    
    // The animation loop callback (that)
    that.callback = options.callback;
    
    // Reset the animation state
    that.reset = function () {
        pixelsPerKeyFrame = that.pixelsPerKeyFrame;
        desiredPixelsPerKeyFrame = that.pixelsPerKeyFrame;
        stopAtNextFrame = -1;
        frameStepSize = 0;
        tickCount = 0;
        frameCount = 0;
        currentPos = that.startPos;
    };
    
    // Draw the image
    that.render = function () {

        // Clear the canvas
        that.context.clearRect(0, 0, that.width, that.height);
    
        // Draw the animation
        that.context.drawImage(
           that.image, // Source image
           0, // Source X
           currentPos, // Source Y (what is animated)
           that.width, // Source (frame) width
           that.frameHeight, // Source (frame) height
           0, // Destination X
           0, // Destination Y
           that.width, // Destination (frame) width
           that.frameHeight); // Destination (frame) height
    };
    
    // Update the image position (animate)
    that.update = function () {
        tickCount += 1;
        
        // Update frame if tick count elapses
        if (tickCount >= that.ticksPerKeyFrame) {
            tickCount = 0;
            frameCount += 1;
            
            // Change frame rate by rate change step size
            if (desiredPixelsPerKeyFrame != pixelsPerKeyFrame) {
                pixelsPerKeyFrame += frameStepSize
                // Correct for overshoot (rate change done)
                if ((frameStepSize < 0 && pixelsPerKeyFrame < desiredPixelsPerKeyFrame) ||
                    (frameStepSize > 0 && pixelsPerKeyFrame > desiredPixelsPerKeyFrame) ||
                    desiredPixelsPerKeyFrame == pixelsPerKeyFrame) {
                    
                    pixelsPerKeyFrame = desiredPixelsPerKeyFrame;
                    that.invokeCallback("rateChangeDone");
                }
            }
            
            // Stop within the number of pixels for key frame step size
            if (stopAtNextFrame >= 0 && Math.abs(currentPos - that.frameHeight * stopAtNextFrame) <= pixelsPerKeyFrame) {
                currentPos = that.currentFrame() * that.frameHeight;
                that.stop();
                return;
            }
            
            // Calculate next Y position
            var nextPos;
            if (that.direction == "forward") {
                nextPos = Math.ceil(currentPos + pixelsPerKeyFrame);
            }
            else {
                nextPos = Math.ceil(currentPos - pixelsPerKeyFrame);
            }
            
            // If the current frame index is in range and within the sprite bounds, animate it
            if (nextPos >= 0 && nextPos <= that.height - that.frameHeight) {
                // Go to the next frame
                currentPos = nextPos;
            } else {
                // Start over
                if (that.direction == "forward") {
                    currentPos = 0;
                }
                else {
                    currentPos = that.height - that.frameHeight;
                }
            }
        }
    };
    
    // Change the rate of the animation over a number of key frames
    that.changeRate = function (desiredRate, keyFrameDelta) {
        if (that.run == false) {
            that.start();
        }
        
        desiredPixelsPerKeyFrame = desiredRate;
        frameStepSize = (desiredPixelsPerKeyFrame - pixelsPerKeyFrame) / keyFrameDelta;
        
        if (frameStepSize < 0) {
            frameStepSize = Math.floor(frameStepSize);
        }
        else {
            frameStepSize = Math.ceil(frameStepSize);
        }
        that.invokeCallback("rateChange");
    };
    
    // Set the pixels per key frame directly
    that.setRate = function (newRate) {
        that.pixelsPerKeyFrame = newRate
        pixelsPerKeyFrame = newRate;
        desiredPixelsPerKeyFrame = newRate;
        that.invokeCallback("rateSet");
    };
    
    // Flips the animation direction
    that.flipDirection = function () {
        if (that.direction == "forward") {
            that.direction = "reverse";
        }
        else {
            that.direction = "forward";
        }
        that.invokeCallback("flipped");
    };
    
    // Run animation loop
    that.animationLoop = function () {
        if (that.run) {
            window.requestAnimationFrame(that.animationLoop);
        }
        
        that.update();
        that.render();
        if (tickCount == 0) {
            that.invokeCallback("update");
        }
    };
    
    // Start the animation
    that.start = function () {
        that.run = true;
        stopAtNextFrame = -1;
        pixelsPerKeyFrame = that.pixelsPerKeyFrame;
        desiredPixelsPerKeyFrame = that.pixelsPerKeyFrame;
        frameCount = 0;
        tickCount = 0;
        that.invokeCallback("start");
        window.requestAnimationFrame(that.animationLoop);
    };
    
    // Stop the animation
    that.stop = function () {
        that.run = false;
        that.invokeCallback("stop");
    };
    
    // Stop the animation on the next frame
    that.stopOnFrame = function (frame) {
        if (frame >= that.numberOfFrames) {
            frame = that.numberOfFrames - 1;
        }
        stopAtNextFrame = frame;
    };
    
    // Gets the current frame (0 indexed)
    that.currentFrame = function () {
        return Math.floor(currentPos / that.frameHeight);
    };
    
    // Invoke the animation callback with the given event
    that.invokeCallback = function (event) {
        if (that.callback != null && that.callback != undefined) {
            that.callback(that, event, frameCount);
        }
    }
    
    // Set the animation state variables
    that.reset();
    
    return that;
}

// Possible winning combinations
var winningCombosThree = [
    {"name": "Winner!! 1x Prize",  "multiplier": 1, "value": [0, 0, 0]},
    {"name": "Winner!! 1x Prize",  "multiplier": 1, "value": [1, 1, 1]},
    {"name": "Winner!! 1x Prize",  "multiplier": 1, "value": [2, 2, 2]},
    {"name": "Bonus!! 2x Prize",   "multiplier": 2, "value": [0, 1, 2]},
    {"name": "Jackpot!! 3x Prize", "multiplier": 3, "value": [2, 1, 0]}
];

// Return true if all spinners have stopped, false otherwise
function spinnersStopped () {
    for (var ind in spinners) {
        if (spinners[ind].run == true) {
            return false;
        }
    }
    return true;
}

// Callback for when results are ready to be parsed and displayed
function resultsReady () {
    // Check if all spinners are done
    if (spinnersStopped() == false) {
        return
    }
    
    var winningCombos = winningCombosThree;
    audioSpinning.pause();
    
    // Determine and display results
    var finalCombo = {"name": "Try Again", "multiplier": -1};
    var win = false;
    for (var i in winningCombos) {
        var combo = winningCombos[i];
        var match = true;
        for (var j = 0; j < combo["value"].length; j += 1) {
            if (combo.value[j] != results[spinners[j].id]) {
                match = false;
                break;
            }
        }
        
        if (match == true) {
            finalCombo = combo;
            win = true;
            break;
        }
    }
    
    $("#resultDiv").html(finalCombo.name);
    credits = credits + finalCombo.multiplier * bet;
    $("#creditAvail").html(credits);
    setTimeout(function() {
        if (win) {
            audioWin.play();
        }
        else {
            audioLose.play();
        }
    }, 100);
    if (credits < 0) {
        $("#creditAvail").css("color", "red");
    }
    else {
        $("#creditAvail").css("color", "black");
    }
    done = true;
}

// Initialize the spinner in the given canvas
function initSpinner (canvasId, pixelsPerFrame, framesPerSecond, animationTime, initialFrame) {
    // Get canvas
    var canvas = document.getElementById(canvasId);
    canvas.width = 200;
    canvas.height = 430;
    
    var spinnerImage = new Image();
    
    var animCallback = function (sender, action, frameCount) {
        (function () {
            var fps = framesPerSecond;
            var animTime = animationTime;
            if (action == "update" && frameCount == animTime * fps) {
                sender.stopOnFrame(results[sender.id]);
            }
            else if (action == "update" && frameCount == 3) {
                sender.flipDirection();
            }
            else if (action == "stop") {
                resultsReady();
            }
        })();
    };
    
    // Create spinner sprite
    var spinner = verticalSprite({
        id: canvasId,
        canvas: canvas,
        numberOfFrames: 4,
        startFrame: initialFrame,
        direction: "forward",
        image: spinnerImage,
        pixelsPerKeyFrame: pixelsPerFrame,
        ticksPerKeyFrame: Math.round(60 / framesPerSecond),
        callback: animCallback
    });
           
    // Render first frame on image load
    spinner.image.addEventListener("load", spinner.render);
    spinnerImage.src = imgSrc;
    
    return spinner;
}

// Global settings and state
var keyRate = 70; // pixels per frame
var fps = 30; // frames per second
var animationTime = 4; // animate for seconds
var results = {}; // Spin results
var spinners = [];
var credits = 150;
var bet = 5;
var imgSrc = "DreadSpinnerReverse.png";
var done = false;
var audioSpinning;
var audioWin;
var audioLose;

// Document ready event
$(document).ready(function () {
    // Initialize spinners
    spinners = [
        initSpinner("spinnerOneAnimation", keyRate, fps, animationTime, 2),
        initSpinner("spinnerTwoAnimation", keyRate, fps, animationTime, 1),
        initSpinner("spinnerThreeAnimation", keyRate, fps, animationTime, 0)
    ];

    $(document).keypress(function (event) {
        var keyCode = event.which || event.keyCode;
        if (keyCode == 13 || keyCode == 32) {
            startSpinner();
        }
    });
    
    // Initialize display state
    $("#creditAvail").html(credits);
    $("#betValue").val(bet);
    done = true;

    // Initialize audio playback
    audioSpinning = new Audio("AudioSpinning.mp3");
    audioWin = new Audio("AudioWin.mp3");
    audioLose = new Audio("AudioLose.mp3");
    audioSpinning.loop = true;

    $("#volumeIcon").css("cursor", "pointer");
    $("#volumeIcon").click(function(){
        audioSpinning.muted = !audioSpinning.muted;
        audioWin.muted = !audioWin.muted;
        audioLose.muted = !audioLose.muted;
        if (audioSpinning.muted) {
            $("#volumeIcon").html("<i class='fas fa-volume-off'></i>");
        }
        else {
            $("#volumeIcon").html("<i class='fas fa-volume-up'></i>");
        }
    });
});

// Start the spinners
function startSpinner () {
    if (done == false) {
        return
    }

    // Reset state
    done = false;
    $("#resultDiv").html("Welcome");
    bet = $("#betValue").val();
    audioSpinning.pause();
    audioSpinning.load();
    audioWin.pause();
    audioWin.load();
    audioLose.pause();
    audioLose.load();
    setTimeout(function() {
        audioSpinning.play();
    }, 250);
    
    for (var ind in spinners) {
        (function () {
            var i = ind;
            
            // Set results ahead of time
            results[spinners[i].id] = Math.round(Math.random() * (spinners[i].numberOfFrames - 2));
            
            // Set delayed start to be 250ms + 500ms after previous spinner
            spinners[i].direction = "forward";
            setTimeout(spinners[i].start, 250 + i * 0);
        }) ();
    }
}