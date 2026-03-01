 recently ran into this issue while developing a game where a user pairs devices using WebSockets. Unfortunately none of the solutions mentioned above work.

In short, the game involved a user subscribing to a channel via a form on their phone. Once subscribed they would shake the device and a scenario would play out on their desktop. The problem was that any time someone shook an iOS device the "undo typing" alert would pop up.

Here are the only two solutions that I've found for this issue.

Prevent your input from ever losing focus. This will require you to prevent form submission if the input is part of a form. You must also listen for "touchstart" instead of "click" on any anchors and prevent the touchstart event from propagating. This will prevent that anchor from gaining focus and your input from losing focus. This approach has some disadvantages for sure.
Add a "keydown" event handler to the window and prevent the event from propagating. This prevents any values from getting inserted into the input on iOS devices. I also had to create an object that mapped the keycodes to the proper character. This is the route I ended going because all I needed in my input was a 6 character code so I only needed numbers. If you need more than just numbers this may be a pain in the ass. On key down, snag that character via the keycode and set the value of the input. This tricks iOS into thinking that no value was ever inserted into the input via the keyboard so there is nothing for it to undo.
Keep in mind preventing the keydown event from propagating does not prevent input on the stock android browser, so it will just function normally. But that is OK since this is not an android issue. You can prevent duplicate values from getting inserted by listening for the input event on the input itself and removing the keydown listener if this event is received.

Copy
var codes = {
  48: 0,
  49: 1,
  50: 2,
  51: 3,
  52: 4,
  53: 5,
  54: 6,
  55: 7,
  56: 8,
  57: 9
},
myInput = document.getElementById("myInput");

var keydownHelper = function (e) {
  e.preventDefault();
  myInput.removeEventListener("input", inputHelper); 

  var val = myInput.value;

  // Delete
  if (e.keyCode === 8 && val.length) {
    myInput.value = val.slice(0, val.length - 1);
    return;
  }

  // If not a number, do nada
  if (typeof codes[e.keyCode] === "undefined") { return; }

  val += codes[e.keyCode];
  myInput.value = val;
};

var inputHelper = function (e) {
  e.preventDefault();
  window.removeEventListener("keydown", keydownHelper);
};

myInput.addEventListener("input", inputHelper);
window.addEventListener("keydown", keydownHelper); 