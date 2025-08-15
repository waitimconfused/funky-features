// import SwiftUI


// struct ContentView: View {
//     var body: some View {
//         VStack {
//             Image(systemName: "globe")
//                 .imageScale(.large)
//                 .foregroundStyle(.tint)
//             Text("Hello, world!")
//         }
//         .padding()
//     }
// }


// #Preview {
//     ContentView()
// }




// import SwiftUI

class $Image {
	/** @type {?string} */
	source = null;

	/** @type {?string} */
	systemName = "question_mark";

	constructor(name) {
		if (name.startsWith("./")) this.source = name;
		else this.systemName = name;
	}

	/** @param {number|"large"} scale */
	imageScale(scale) {}

	foregroundStyle(style) {}
}

function Image(name) { return new Image(name); }


function ContentView() {
	var body = new View(
		VStack(
			Image("globe")
				.imageScale("large")
				.foregroundStyle("tint"),
			Text("Hello, world!")
		)
		.padding()
	);

	return body;
}


Preview = [
	ContentView()
]