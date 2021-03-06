exports.parse = (multipartBuffer, boundary) => {

    let process = file => {
      let headers = file.header.split('; ');
      return {
        data:     new Buffer(file.part),
        field:    file.field,
        filename: headers[2] ? headers[2].split('"')[1] : '',
        name:     headers[1].split('"')[1],
        type:     file.info ? file.info.split(': ')[1] : false
      };
    };
  
    let lastline = '';
    let lIndex,fIndex = -1;
    let header   = '';
    let field    = '';
    let info     = '';
    let state    = 0;
    let buffer   = [];
    let files    = [];
  
    for (let i = 0; i < multipartBuffer.length; i++) {
      let currByte        = multipartBuffer[i];
      let prevByte        = i > 0 ? multipartBuffer[i - 1] : null;
      let newLineDetected = (currByte === 0x0a) && (prevByte === 0x0d);
      let newLineChar     = (currByte === 0x0a) || (currByte === 0x0d);
  
      if(fIndex == -1) {
        fIndex = i;
      }
      if (!newLineChar) {
        lIndex = i;
        lastline += String.fromCharCode(currByte);
      }
  
      if ((0 === state) && newLineDetected) {
        if (`--${boundary}` === lastline) {
          state = 1;
        }
        lastline = '';
        fIndex = -1;
      } else if ((1 === state) && newLineDetected) {
        header   = lastline;
        lastline = '';
        fIndex = -1;
        state    = 2;
      } else if ((2 === state) && newLineDetected) {
        info     = lastline;
        lastline = '';
        fIndex = -1;
        state    = 3;
      } else if ((3 === state) && newLineDetected) {
        field    = multipartBuffer.slice(fIndex, lIndex+1).toLocaleString('utf-8');      
        buffer   = [];
        lastline = '';
        fIndex = -1;
        state    = 4;
      } else if (4 === state) {
        if (lastline.length > (boundary.length + 4)) {
          lastline = '';
          fIndex = -1;
        }
  
        if (`--${boundary}` === lastline) {
          let j = buffer.length - lastline.length;
          let part = buffer.slice(0, j - 1);
  
          files.push(process({
            field:  field,
            header: header,
            info:   info,
            part:   part
          }));
  
          buffer   = [];
          header   = '';
          info     = '';
          lastline = '';
          fIndex = -1;
          state    = 5;
        } else {
          buffer.push(currByte);
        }
        if (newLineDetected) {
          lastline = '';
          fIndex = -1;
        }
      } else if (5 === state && newLineDetected) {
        state = 1;
      }
    }
    return files;
  };
  
  exports.getBoundary = header => {
    header = header['Content-Type'] ? header['Content-Type'] : header;
    return header.split('; boundary=')[1];
  };
  