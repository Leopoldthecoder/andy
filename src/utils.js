const base64Img2Blob = code => {
  const parts = code.split(';base64,')
  const contentType = parts[0].split(':')[1]
  const raw = window.atob(parts[1])
  const rawLength = raw.length

  const uInt8Array = new Uint8Array(rawLength)

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }

  return new Blob([uInt8Array], { type: contentType })
}

export function getObjectUrl (content) {
  return URL.createObjectURL(base64Img2Blob(content))
}

export function hex2rgb (str) {
  const hex = str.replace('#', '')
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16)
  }
}

export function getBreakpoints ({ height, width }) {
  return [{
    x: 0,
    y: 0
  }, {
    x: width / 2,
    y: 0
  }, {
    x: 0,
    y: height / 2
  }, {
    x: width / 2,
    y: height / 2
  }]
}
