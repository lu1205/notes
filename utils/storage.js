// 简单的加密解密工具

// 获取用户密码
function getPassword() {
  try {
    const password = uni.getStorageSync('app_password');
    return password || 'notes-app-secret-key-2024'; // 默认密码
  } catch (error) {
    console.error('获取密码失败:', error);
    return 'notes-app-secret-key-2024'; // 默认密码
  }
}

// 设置用户密码
function setPassword(password) {
  try {
    uni.setStorageSync('app_password', password);
    return true;
  } catch (error) {
    console.error('设置密码失败:', error);
    return false;
  }
}

// 检查是否设置了密码
function hasPassword() {
  try {
    const password = uni.getStorageSync('app_password');
    return !!password;
  } catch (error) {
    console.error('检查密码失败:', error);
    return false;
  }
}

// 简单的加密函数
function encrypt(data, password = getPassword()) {
  const text = JSON.stringify(data);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
    result += String.fromCharCode(charCode);
  }
  // 将结果转换为Base64，避免存储问题
  return btoa(unescape(encodeURIComponent(result)));
}

// 简单的解密函数
function decrypt(encryptedData, password = getPassword()) {
  try {
    // 从Base64解码
    const text = decodeURIComponent(escape(atob(encryptedData)));
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ password.charCodeAt(i % password.length);
      result += String.fromCharCode(charCode);
    }
    return JSON.parse(result);
  } catch (error) {
    console.error('解密失败:', error);
    // 如果解密失败，尝试使用默认密码解密（兼容旧数据）
    if (password !== 'notes-app-secret-key-2024') {
      return decrypt(encryptedData, 'notes-app-secret-key-2024');
    }
    return null;
  }
}

// 获取文件存储路径
function getNotesFilePath() {
  return '_doc/notes.txt';
}

// 保存文件
function saveFile(content) {
  return new Promise((resolve, reject) => {
    if (typeof plus !== 'undefined') {
      // 使用plus.io保存文件
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => {
        fs.root.getFile(getNotesFilePath(), {create: true}, fileEntry => {
          fileEntry.createWriter(writer => {
            writer.onwriteend = function() {
              resolve(true);
            };
            writer.onerror = function(e) {
              console.error('写入文件失败:', e);
              reject(e);
            };
            writer.write(content);
          }, error => {
            console.error('创建文件写入器失败:', error);
            reject(error);
          });
        }, error => {
          console.error('获取文件失败:', error);
          reject(error);
        });
      }, error => {
        console.error('请求文件系统失败:', error);
        reject(error);
      });
    } else {
      // 小程序环境下使用本地存储作为降级方案
      try {
        uni.setStorageSync('notes', content);
        resolve(true);
      } catch (error) {
        console.error('保存到本地存储失败:', error);
        reject(error);
      }
    }
  });
}

// 读取文件
function readFile() {
  return new Promise((resolve, reject) => {
    if (typeof plus !== 'undefined') {
      // 使用plus.io读取文件
      plus.io.requestFileSystem(plus.io.PRIVATE_DOC, fs => {
        fs.root.getFile(getNotesFilePath(), {create: true}, fileEntry => {
          fileEntry.file(file => {
            const reader = new plus.io.FileReader();
            reader.onloadend = function(e) {
              resolve(e.target.result || '');
            };
            reader.onerror = function(e) {
              console.error('读取文件失败:', e);
              reject(e);
            };
            reader.readAsText(file, 'utf-8');
          }, error => {
            console.error('获取文件失败:', error);
            reject(error);
          });
        }, error => {
          console.error('获取文件失败:', error);
          reject(error);
        });
      }, error => {
        console.error('请求文件系统失败:', error);
        reject(error);
      });
    } else {
      // 小程序环境下使用本地存储作为降级方案
      try {
        const content = uni.getStorageSync('notes');
        resolve(content || '');
      } catch (error) {
        console.error('读取本地存储失败:', error);
        reject(error);
      }
    }
  });
}

// 笔记存储工具
const NoteStorage = {
  // 获取所有笔记
  async getAllNotes() {
    try {
      const encryptedNotes = await readFile();
      if (encryptedNotes) {
        const notes = decrypt(encryptedNotes);
        console.log('解密后的笔记:', notes);
        return notes || [];
      }
      return [];
    } catch (error) {
      console.error('获取笔记失败:', error);
      return [];
    }
  },

  // 保存笔记
  async saveNote(note) {
    try {
      const notes = await this.getAllNotes();
      const timestamp = Date.now();
      
      if (note.id) {
        // 更新现有笔记
        const index = notes.findIndex(n => n.id === note.id);
        if (index !== -1) {
          notes[index] = {
            ...notes[index],
            ...note,
            updatedAt: timestamp
          };
        }
      } else {
        // 创建新笔记
        const newNote = {
          id: `note-${timestamp}`,
          title: note.title || '无标题',
          content: note.content || '',
          createdAt: timestamp,
          updatedAt: timestamp
        };
        notes.unshift(newNote); // 新笔记添加到开头
      }
      
      const encryptedNotes = encrypt(notes);
      await saveFile(encryptedNotes);
      return true;
    } catch (error) {
      console.error('保存笔记失败:', error);
      return false;
    }
  },
  
  // 重新加密所有笔记（用于密码变更时）
  async reencryptNotes() {
    try {
      // 先获取所有笔记（会尝试用默认密码解密）
      const notes = await this.getAllNotes();
      // 无论笔记是否为空，都尝试重新加密（空数组也需要加密存储）
      const encryptedNotes = encrypt(notes);
      await saveFile(encryptedNotes);
      return true;
    } catch (error) {
      console.error('重新加密笔记失败:', error);
      // 即使重新加密失败，也不影响密码修改的成功状态
      return true;
    }
  },

  // 删除笔记
  async deleteNote(id) {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      const encryptedNotes = encrypt(filteredNotes);
      await saveFile(encryptedNotes);
      return true;
    } catch (error) {
      console.error('删除笔记失败:', error);
      return false;
    }
  },

  // 获取单个笔记
  async getNote(id) {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.id === id) || null;
    } catch (error) {
      console.error('获取笔记失败:', error);
      return null;
    }
  },
  
  // 密码相关方法
  setPassword(password) {
    return setPassword(password);
  },
  
  hasPassword() {
    return hasPassword();
  },
  
  // 验证密码
  verifyPassword(password) {
    try {
      const currentPassword = uni.getStorageSync('app_password');
      return currentPassword === password;
    } catch (error) {
      console.error('验证密码失败:', error);
      return false;
    }
  },
  
  // 加密笔记数据
  async encryptNotes(notes) {
    try {
      const encryptedNotes = encrypt(notes);
      await saveFile(encryptedNotes);
      return true;
    } catch (error) {
      console.error('加密笔记失败:', error);
      return false;
    }
  }
};

export default NoteStorage;