module.exports = class glPower{
    constructor(gl){
        console.log("GLパワーをみせつけろ");
        this.gl = gl;
        this.objs = [];
        this.screen = { 
            vertices: [-1.0,1.0,0.0,1.0,1.0,0.0,-1.0,-1.0,0.0,1.0,-1.0,0.0],
            index: [0,1,2,1,3,2],
        };

        this.currentObj = null;

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.clearColor(0,0,0,1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.ext = this.getWebGLExtensions();
    }

    cObject(param){
        let vs = this.cShader(param.vertex,this.gl.VERTEX_SHADER);
        let fs = this.cShader(param.fragment,this.gl.FRAGMENT_SHADER);
        let prg = this.cProgram(vs,fs);
        let uni = this.cUniforms(prg,param.uniforms);        
        let att = this.cAttributes(prg,param.attributes)
        let obj = new glObject(prg,att,uni);
        this.objs.push(obj);
        return obj;
    }

    cProgram(vs,fs){
        let p = this.gl.createProgram();
        this.gl.attachShader(p,vs);
        this.gl.attachShader(p,fs);
        this.gl.linkProgram(p);
        
        if(this.gl.getProgramParameter(p, this.gl.LINK_STATUS)){
            this.gl.useProgram(p);
            return p;
        }else{
            console.log(alert(this.gl.getProgramInfoLog(p)));
            return null;
        }
    }

    cShader(source,type){
        let shader = this.gl.createShader(type);
        this.gl.shaderSource(shader,source);
        this.gl.compileShader(shader);
    
        if(this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)){
            return shader;
        }else{
            console.log(this.gl.getShaderInfoLog(shader));
            return null;
        }
    }

    /*------------------
        Uniforms
    -------------------*/

    cUniforms(prg,uniParam){
        let uni = {};
        let keys = Object.keys(uniParam);
        
        for(let i = 0; i < keys.length; i++){
            let key = keys[i];
            uni[key] = {
                location: this.gl.getUniformLocation(prg,key.toString()),
                type: uniParam[key].type,
                value: uniParam[key].value
            }
        }
        return uni;
    }

    setUniform(uni){
        let type = uni.type;
        switch(type){
            
            case 'uniformMatrix4fv':
                this.gl[type](uni.location,false,uni.value);
                break;
            default:
                this.gl[type](uni.location,uni.value);
        }
    }

    /*------------------
        Attributes
    -------------------*/

    cAttributes(prg,attParams){
        let atts = {};
        let keys = Object.keys(attParams);
        for(let i = 0; i < keys.length; i++){
            let key = keys[i];
            atts[key] = {};
            atts[key]["location"] = this.gl.getAttribLocation(prg,key.toString());
            atts[key]['vbo'] = this.cVBO(attParams[key].vertices);
            atts[key]['stride'] = attParams[key].stride;
            if(attParams[key].index != null){
                atts[key]['ibo'] = this.cIBO(attParams[key].index);
            }
        }
        return atts;
    }

    setAttribute(att){        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER,att.vbo.data);
        this.gl.enableVertexAttribArray(att.location);
        this.gl.vertexAttribPointer(att.location, att.stride, this.gl.FLOAT, false, 0, 0);
        this.currentObj.VBOLength = att.vbo.length / att.stride;
        
        if(att.ibo){
            this.currentObj.indexLength = att.ibo.length;
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, att.ibo.data);
        }
    }

    cVBO(data){
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return {data : vbo,length: data.length};
    }
    
    cIBO(data){
        let ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        return {data : ibo,length : data.length};
    }

    /*------------------
        FrameBuffer
    -------------------*/
    cFbuffer(width,height,texUnit,floatMode = false){
        let fb;
        if(floatMode){
            fb = this.getFbufferFloat(width,height,texUnit);
        }else{
            fb = this.getFbuffer(width,height,texUnit);
        }
       
        this.gl.bindTexture(this.gl.TEXTURE_2D,fb.texture);
        this.gl.clearColor(0,0,0,1);
        
        return fb;
    }

    getFbuffer(width,height,texUnit){
        let frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        let depthRenderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, depthRenderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, width, height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, depthRenderBuffer);

        let fTexture = this.gl.createTexture();

        this.gl.activeTexture(this.gl.TEXTURE0 + texUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, renderbuffer: depthRenderBuffer, texture: fTexture,texUnit:texUnit};
    }

    getFbufferFloat( width, height,texUnit){
        if(this.ext == null || (this.ext.textureFloat == null && this.ext.textureHalfFloat == null)){
            console.log('float texture not support');
            return;
        }

        // let flg = (this.ext.textureFloat != null) ? this.gl.FLOAT : this.ext.textureHalfFloat.HALF_FLOAT_OES;
        let flg = this.ext.textureHalfFloat.HALF_FLOAT_OES;
        let frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);
        let fTexture = this.gl.createTexture();
        this.gl.activeTexture(this.gl.TEXTURE0 + texUnit);
        this.gl.bindTexture(this.gl.TEXTURE_2D, fTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, flg, null);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fTexture, 0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        return {framebuffer: frameBuffer, texture: fTexture,texUnit:texUnit};
    }

    selectFramebuffer(fb){
        if(fb == null){
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,null);
        }else{
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER,fb.framebuffer)
        }   
    }

    /*------------------
        Draw
    -------------------*/

    draw(obj,mode){
        this.selectUseProgram(obj);
        
        //update attributes
        for(let k in obj.attributes){
            let att = obj.attributes[k];
            this.setAttribute(att);
        }
        //update uniforms
        for(let k in obj.uniforms){
            let uni = obj.uniforms[k];
            this.setUniform(uni);
        }

        this.clear();
        switch(mode){
            case 'POINT':
                this.gl.drawArrays('POINT', 0, this.currentObj.VBOLength);
            break;
            case 'MESH':
                this.gl.drawElements(this.gl.TRIANGLES,this.currentObj.indexLength,this.gl.UNSIGNED_SHORT,0);
            break;
        }
        this.flush();
    }

    selectUseProgram(obj){
        this.currentObj = obj;
        this.gl.useProgram(this.currentObj.program);
    }

    clear(){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    flush(){
        this.gl.flush();
    }


    getWebGLExtensions(){
        return {
            elementIndexUint: this.gl.getExtension('OES_element_index_uint'),
            textureFloat:     this.gl.getExtension('OES_texture_float'),
            textureHalfFloat: this.gl.getExtension('OES_texture_half_float')
        };
    }
}

class glObject{
    constructor(program,attributes,uniforms){
        this.indexLength;
        this.VBOLength;
        this.program = program;
        this.attributes = attributes;
        this.uniforms = uniforms;
    }
}
