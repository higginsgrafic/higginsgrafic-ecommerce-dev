// Extreu fotogrames d'un video amb AVFoundation (natiu del macOS).
//
// PER QUE AIXO
//
// L'ffmpeg d'aquesta maquina esta trencat (busca libx265.209 i nome s hi ha la
// .216, i el simbol no coincideix), i el Chromium en mode headless no sap
// llegir H.264. AVFoundation, en canvi, es del sistema i llegeix el video
// sense problemes.
//
// COM ES FA SERVIR
//
//   swift scripts/extrau-fotogrames.swift <video> [quants]
//
// Des dels fotogrames a /tmp/fotograma-N.png

import AVFoundation
import AppKit
import Foundation

let args = CommandLine.arguments
guard args.count >= 2 else {
    print("Cal dir el video: swift scripts/extrau-fotogrames.swift <video> [quants]")
    exit(1)
}
let ruta = args[1]
let quants = args.count > 2 ? (Int(args[2]) ?? 6) : 6

let url = URL(fileURLWithPath: ruta)
guard FileManager.default.fileExists(atPath: ruta) else {
    print("No trobo el fitxer: \(ruta)")
    exit(1)
}

let asset = AVURLAsset(url: url)
let durada = CMTimeGetSeconds(asset.duration)
let pista = asset.tracks(withMediaType: .video).first
let mida = pista?.naturalSize ?? .zero

print("  durada: \(String(format: "%.2f", durada))s   \(Int(mida.width))x\(Int(mida.height))")

let generador = AVAssetImageGenerator(asset: asset)
generador.appliesPreferredTrackTransform = true
generador.requestedTimeToleranceBefore = .zero
generador.requestedTimeToleranceAfter = .zero

for i in 0..<quants {
    let segon = durada * (Double(i) + 0.5) / Double(quants)
    let temps = CMTime(seconds: segon, preferredTimescale: 600)
    do {
        let imatge = try generador.copyCGImage(at: temps, actualTime: nil)
        let bitmap = NSBitmapImageRep(cgImage: imatge)
        guard let dades = bitmap.representation(using: .png, properties: [:]) else { continue }
        let nom = String(format: "/tmp/fotograma-%02d.png", i + 1)
        try dades.write(to: URL(fileURLWithPath: nom))
        print("  \(nom)  (al segon \(String(format: "%.2f", segon)))")
    } catch {
        print("  no he pogut extreure el fotograma \(i + 1): \(error.localizedDescription)")
    }
}
print("  fets!")
