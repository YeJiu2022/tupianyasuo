// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const previewSection = document.getElementById('previewSection');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const originalDimensions = document.getElementById('originalDimensions');
const compressedSize = document.getElementById('compressedSize');
const compressionRate = document.getElementById('compressionRate');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadButton = document.getElementById('downloadButton');

// 当前处理的图片数据
let currentFile = null;

// 初始化事件监听
function initializeEventListeners() {
    // 点击上传按钮触发文件选择
    uploadButton.addEventListener('click', () => fileInput.click());

    // 文件选择变更事件
    fileInput.addEventListener('change', handleFileSelect);

    // 拖放事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#0071e3';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#d2d2d7';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#d2d2d7';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 质量滑块变更事件
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        if (currentFile) {
            compressImage(currentFile, e.target.value / 100);
        }
    });

    // 下载按钮点击事件
    downloadButton.addEventListener('click', downloadCompressedImage);
}

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

// 处理文件
function handleFile(file) {
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB！');
        return;
    }

    currentFile = file;
    displayOriginalImage(file);
    compressImage(file, qualitySlider.value / 100);
    previewSection.style.display = 'block';
}

// 显示原始图片
function displayOriginalImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
        
        // 获取图片尺寸
        const img = new Image();
        img.onload = () => {
            originalDimensions.textContent = `${img.width} x ${img.height}`;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 压缩图片
function compressImage(file, quality) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // 压缩图片
            canvas.toBlob(
                (blob) => {
                    compressedPreview.src = URL.createObjectURL(blob);
                    compressedSize.textContent = formatFileSize(blob.size);
                    
                    // 计算压缩率
                    const rate = ((file.size - blob.size) / file.size * 100).toFixed(1);
                    compressionRate.textContent = `${rate}%`;
                },
                'image/jpeg',
                quality
            );
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 下载压缩后的图片
function downloadCompressedImage() {
    const link = document.createElement('a');
    link.download = `compressed_${currentFile.name}`;
    link.href = compressedPreview.src;
    link.click();
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化应用
initializeEventListeners(); 