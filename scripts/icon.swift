import AppKit
let image = NSImage(size: NSSize(width: 1024, height: 1024))
image.lockFocus()
NSColor(calibratedRed: 0.07, green: 0.40, blue: 0.27, alpha: 1).setFill()
NSBezierPath(roundedRect: NSRect(x: 24, y: 24, width: 976, height: 976), xRadius: 210, yRadius: 210).fill()
let text = NSAttributedString(string: "o2", attributes: [.font: NSFont.systemFont(ofSize: 530, weight: .semibold), .foregroundColor: NSColor.white])
let bounds = text.size()
text.draw(at: NSPoint(x: (1024 - bounds.width) / 2, y: (1024 - bounds.height) / 2 + 20))
image.unlockFocus()
let bitmap = NSBitmapImageRep(data: image.tiffRepresentation!)!
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
