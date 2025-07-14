document.addEventListener('DOMContentLoaded', () => {
  // Biến lưu trạng thái hiện tại
  const state = {
    notes: [], // Ghi chú trong danh mục hiện tại
    allNotes: [], // Tất cả các ghi chú
    categories: [],
    currentCategoryId: 'all',
    sortField: 'created_at',
    sortOrder: 'DESC',
    currentNote: null,
  };

  // Khởi tạo modals
  const noteModal = new bootstrap.Modal(document.getElementById('noteModal'));
  const categoryModal = new bootstrap.Modal(document.getElementById('categoryModal'));
  const manageCategoriesModal = new bootstrap.Modal(document.getElementById('manageCategoriesModal'));
  const editCategoryModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
  
  // Lấy các elements
  const notesList = document.getElementById('notesList');
  const categoriesList = document.getElementById('categoriesList');
  const categorySelect = document.getElementById('noteCategory');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  
  // Các phương thức xử lý API
  const api = {
    // Lấy tất cả ghi chú
    getNotes: async (categoryId = null, sort = state.sortField, order = state.sortOrder) => {
      let url = `/api/notes?sort=${sort}&order=${order}`;
      if (categoryId && categoryId !== 'all') {
        url += `&category=${categoryId}`;
      }
      const response = await fetch(url);
      return await response.json();
    },
    
    // Lấy một ghi chú theo ID
    getNote: async (id) => {
      const response = await fetch(`/api/notes/${id}`);
      return await response.json();
    },
    
    // Tạo ghi chú mới
    createNote: async (note) => {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      return await response.json();
    },
    
    // Cập nhật ghi chú
    updateNote: async (id, note) => {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(note),
      });
      return await response.json();
    },
    
    // Xóa ghi chú
    deleteNote: async (id) => {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    },
    
    // Tìm kiếm ghi chú
    searchNotes: async (term) => {
      const response = await fetch(`/api/notes/search/${term}`);
      return await response.json();
    },
    
    // Lấy tất cả danh mục
    getCategories: async () => {
      const response = await fetch('/api/notes/categories/all');
      return await response.json();
    },
    
    // Thêm danh mục mới
    createCategory: async (name) => {
      const response = await fetch('/api/notes/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      return await response.json();
    },

    // Cập nhật danh mục
    updateCategory: async (id, name) => {
      const response = await fetch(`/api/notes/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      return await response.json();
    },

    // Xóa danh mục
    deleteCategory: async (id) => {
      const response = await fetch(`/api/notes/categories/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    }
  };
  
  // Hiển thị danh sách ghi chú với hiệu ứng
  const renderNotes = (notes) => {
    // Trước khi render mới, thêm hiệu ứng fadeOut cho các note hiện tại
    const existingNotes = notesList.querySelectorAll('.col-md-6');
    if (existingNotes.length > 0) {
      existingNotes.forEach(note => {
        note.style.opacity = '1';
        note.style.transition = 'all 0.3s ease';
        setTimeout(() => {
          note.style.opacity = '0';
          note.style.transform = 'translateY(10px)';
        }, 0);
      });

      // Đợi hiệu ứng fadeOut hoàn thành rồi mới render
      setTimeout(() => {
        renderNotesContent(notes);
      }, 300); // 300ms là thời gian của hiệu ứng transition
    } else {
      renderNotesContent(notes);
    }
  };

  // Hiển thị nội dung danh sách ghi chú
  const renderNotesContent = (notes) => {
    notesList.innerHTML = '';
    
    if (notes.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'col-12 text-center py-5';
      emptyState.innerHTML = `
        <div class="py-5">
          <i class="bi bi-journal-x" style="font-size: 4rem; color: #d1d5db;"></i>
          <h4 class="mt-3">Không có ghi chú nào</h4>
          <p class="text-muted">Bắt đầu bằng cách tạo ghi chú mới</p>
          <button class="btn btn-primary mt-2" id="emptyStateNewNoteBtn">
            <i class="bi bi-plus-lg me-2"></i>Tạo ghi chú mới
          </button>
        </div>
      `;
      notesList.appendChild(emptyState);
      
      document.getElementById('emptyStateNewNoteBtn').addEventListener('click', openNewNoteModal);
      return;
    }
    
    notes.forEach((note, index) => {
      const noteCard = document.createElement('div');
      noteCard.className = 'col-md-6 col-lg-4';
      noteCard.style.opacity = '0';
      noteCard.style.transform = 'translateY(10px)';
      
      // Màu ngẫu nhiên cho viền trên của note card
      const colors = [
        'var(--primary-color)',
        'var(--secondary-color)',
        'var(--accent-color)',
        'var(--success-color)',
      ];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      noteCard.innerHTML = `
        <div class="card card-note" data-id="${note.id}" style="border-top: 4px solid ${randomColor};">
          <div class="card-body">
            <h5 class="card-title">${escapeHtml(note.title)}</h5>
            <p class="card-text">${escapeHtml(note.content || '')}</p>
            ${note.note ? `<small class="text-muted"><i class="bi bi-pencil-square me-1"></i>${escapeHtml(note.note)}</small>` : ''}
          </div>
          <div class="card-footer bg-transparent">
            <span>
              ${note.category_name 
                ? `<span class="badge category-badge">${escapeHtml(note.category_name)}</span>` 
                : ''}
            </span>
            <span class="date">
              <i class="bi bi-calendar3 me-1"></i>${formatDate(note.created_at)}
            </span>
          </div>
        </div>
      `;
      
      // Sự kiện click để xem/sửa ghi chú
      noteCard.querySelector('.card-note').addEventListener('click', (e) => {
        // Thêm hiệu ứng click
        const card = e.currentTarget;
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.transform = 'scale(1)';
          setTimeout(() => {
            openEditNoteModal(note);
          }, 150);
        }, 150);
      });
      
      notesList.appendChild(noteCard);
      
      // Animation delay để hiệu ứng nối tiếp
      setTimeout(() => {
        noteCard.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        noteCard.style.opacity = '1';
        noteCard.style.transform = 'translateY(0)';
      }, 50 + index * 60);
    });
  };
  
  // Hiển thị danh mục
  const renderCategories = (categories) => {
    // Xóa toàn bộ danh mục hiện tại
    categoriesList.innerHTML = '';
    
    // Đếm tổng số ghi chú
    const totalNotes = state.notes.length;
    
    // Thêm mục "Tất cả" đầu tiên
    const allCategoryItem = document.createElement('a');
    allCategoryItem.href = '#';
    allCategoryItem.className = `list-group-item list-group-item-action d-flex align-items-center ${state.currentCategoryId === 'all' ? 'active' : ''}`;
    allCategoryItem.dataset.categoryId = 'all';
    allCategoryItem.innerHTML = `
      <i class="bi bi-grid-fill me-2"></i>
      <span>Tất cả</span>
      <span class="ms-auto badge bg-light text-dark">${totalNotes}</span>
    `;
    
    // Thêm sự kiện click cho mục "Tất cả"
    allCategoryItem.addEventListener('click', (e) => {
      e.preventDefault();
      selectCategory('all');
    });
    
    categoriesList.appendChild(allCategoryItem);
    
    // Render các danh mục
    categories.forEach(category => {
      // Đếm số lượng note trong category này
      const noteCount = state.notes.filter(note => note.category_id === category.id).length;
      
      const item = document.createElement('a');
      item.href = '#';
      item.className = `list-group-item list-group-item-action d-flex align-items-center ${state.currentCategoryId === category.id ? 'active' : ''}`;
      item.dataset.categoryId = category.id;
      item.innerHTML = `
        <i class="bi bi-folder me-2"></i>
        <span>${escapeHtml(category.name)}</span>
        <span class="ms-auto badge bg-light text-dark">${noteCount}</span>
      `;
      
      item.addEventListener('click', (e) => {
        e.preventDefault();
        selectCategory(category.id);
      });
      
      categoriesList.appendChild(item);
    });
    
    // Áp dụng hiệu ứng cho các mục danh mục
    const categoryItems = categoriesList.querySelectorAll('.list-group-item');
    categoryItems.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-10px)';
      setTimeout(() => {
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
      }, 50 + index * 40);
    });
    
    // Populate select in note form
    categorySelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Chọn danh mục';
    categorySelect.appendChild(defaultOption);
    
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  };

  // Cập nhật số lượng ghi chú trong danh mục
  const updateCategoryCounts = () => {
    // Cập nhật số lượng trong mục "Tất cả"
    const allCategoryBadge = document.querySelector('#categoriesList [data-category-id="all"] .badge');
    if (allCategoryBadge) {
      allCategoryBadge.textContent = state.allNotes.length;
    }
    
    // Cập nhật số lượng trong các danh mục khác
    state.categories.forEach(category => {
      const categoryBadge = document.querySelector(`#categoriesList [data-category-id="${category.id}"] .badge`);
      if (categoryBadge) {
        const count = state.allNotes.filter(note => note.category_id === category.id).length;
        categoryBadge.textContent = count;
      }
    });
  };
  
  // Chọn danh mục với hiệu ứng
  const selectCategory = async (categoryId) => {
    if (state.currentCategoryId === categoryId) return; // Không làm gì nếu đã chọn danh mục này rồi
    
    state.currentCategoryId = categoryId;
    
    // Cập nhật trạng thái active trong UI với hiệu ứng
    document.querySelectorAll('#categoriesList .list-group-item').forEach(item => {
      item.classList.remove('active');
    });
    
    const activeItem = document.querySelector(`#categoriesList [data-category-id="${categoryId}"]`);
    if (activeItem) {
      activeItem.classList.add('active');
      
      // Hiệu ứng highlight khi chọn
      activeItem.style.transform = 'scale(0.98)';
      setTimeout(() => {
        activeItem.style.transform = 'scale(1)';
      }, 150);
    }
    
    // Cập nhật tiêu đề danh mục hiện tại với hiệu ứng
    const categoryTitleElement = document.getElementById('currentCategory');
    const oldText = categoryTitleElement.textContent;
    
    // Hiệu ứng fade out
    categoryTitleElement.style.transition = 'opacity 0.2s ease';
    categoryTitleElement.style.opacity = '0';
    
    setTimeout(() => {
      // Cập nhật nội dung sau khi fade out
      const categoryName = categoryId === 'all' 
        ? 'Tất cả ghi chú' 
        : state.categories.find(c => c.id == categoryId)?.name || 'Ghi chú';
      
      categoryTitleElement.innerHTML = `<i class="bi bi-journal-text me-2"></i>${categoryName}`;
      
      // Hiệu ứng fade in
      categoryTitleElement.style.opacity = '1';
    }, 200);
    
    // Hiển thị spinner khi đang tải
    notesList.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2">Đang tải ghi chú...</p>
      </div>
    `;
    
    // Fetch and render notes for the selected category
    try {
      const notes = await api.getNotes(categoryId !== 'all' ? categoryId : null);
      state.notes = notes;
      
      // Nếu đang hiển thị tất cả, cập nhật allNotes
      if (categoryId === 'all') {
        state.allNotes = [...notes];
      }
      
      // Đợi một chút để hiển thị spinner
      setTimeout(() => {
        renderNotes(notes);
        updateCategoryCounts(); // Cập nhật số lượng ghi chú trong danh mục
      }, 300);
    } catch (error) {
      console.error('Lỗi khi tải ghi chú theo danh mục:', error);
      notesList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">Đã xảy ra lỗi khi tải ghi chú. Vui lòng thử lại!</div>
        </div>
      `;
    }
  };
  
  // Mở modal thêm ghi chú mới
  const openNewNoteModal = () => {
    // Reset form
    document.getElementById('noteForm').reset();
    document.getElementById('noteId').value = '';
    document.getElementById('noteModalLabel').innerHTML = '<i class="bi bi-pen me-2"></i>Ghi chú mới';
    state.currentNote = null;
    noteModal.show();
    
    // Focus vào trường tiêu đề sau khi modal hiển thị
    noteModal._element.addEventListener('shown.bs.modal', function () {
      document.getElementById('noteTitle').focus();
    }, { once: true });
  };
  
  // Mở modal sửa ghi chú
  const openEditNoteModal = (note) => {
    document.getElementById('noteId').value = note.id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content || '';
    document.getElementById('noteNote').value = note.note || '';
    document.getElementById('noteCategory').value = note.category_id || '';
    document.getElementById('noteModalLabel').innerHTML = '<i class="bi bi-pencil me-2"></i>Chỉnh sửa ghi chú';
    state.currentNote = note;
    noteModal.show();
  };
  
  // Lưu ghi chú với hiệu ứng thông báo
  const saveNote = async () => {
    const noteId = document.getElementById('noteId').value;
    const noteData = {
      title: document.getElementById('noteTitle').value.trim(),
      content: document.getElementById('noteContent').value.trim(),
      note: document.getElementById('noteNote').value.trim(),
      category_id: document.getElementById('noteCategory').value || null,
    };
    
    if (!noteData.title) {
      showToast('Thông báo', 'Tiêu đề là bắt buộc!', 'warning');
      document.getElementById('noteTitle').focus();
      return;
    }
    
    // Hiển thị hiệu ứng đang lưu
    const saveBtn = document.getElementById('saveNoteBtn');
    const originalBtnText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang lưu...';
    
    try {
      if (noteId) {
        // Cập nhật ghi chú
        await api.updateNote(noteId, noteData);
        showToast('Thành công', 'Ghi chú đã được cập nhật thành công!', 'success');
      } else {
        // Tạo ghi chú mới
        await api.createNote(noteData);
        showToast('Thành công', 'Ghi chú đã được tạo thành công!', 'success');
      }
      
      noteModal.hide();
      
      // Tải lại ghi chú sau khi lưu thành công
      loadNotes();
    } catch (error) {
      console.error('Lỗi khi lưu ghi chú:', error);
      showToast('Lỗi', 'Có lỗi xảy ra khi lưu ghi chú!', 'danger');
    } finally {
      // Khôi phục nút lưu
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalBtnText;
    }
  };
  
  // Xóa ghi chú với xác nhận
  const deleteNote = async () => {
    if (!state.currentNote) return;
    
    // Hiển thị modal xác nhận
    if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) {
      return;
    }
    
    // Hiển thị hiệu ứng đang xóa
    const deleteBtn = document.querySelector('#noteModal .btn-danger');
    const originalBtnText = deleteBtn.innerHTML;
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xóa...';
    
    try {
      await api.deleteNote(state.currentNote.id);
      noteModal.hide();
      showToast('Thành công', 'Ghi chú đã được xóa thành công!', 'success');
      loadNotes();
    } catch (error) {
      console.error('Lỗi khi xóa ghi chú:', error);
      showToast('Lỗi', 'Có lỗi xảy ra khi xóa ghi chú!', 'danger');
      // Khôi phục nút xóa
      deleteBtn.disabled = false;
      deleteBtn.innerHTML = originalBtnText;
    }
  };
  
  // Tìm kiếm ghi chú với hiệu ứng
  const searchNotes = async () => {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
      loadNotes();
      return;
    }
    
    // Hiển thị hiệu ứng đang tìm kiếm
    notesList.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tìm kiếm...</span>
        </div>
        <p class="mt-2">Đang tìm kiếm ghi chú...</p>
      </div>
    `;
    
    try {
      const results = await api.searchNotes(searchTerm);
      state.notes = results;
      
      // Đợi một chút để hiển thị spinner
      setTimeout(() => {
        renderNotes(results);
        
        // Cập nhật tiêu đề danh mục hiện tại
        const categoryTitleElement = document.getElementById('currentCategory');
        categoryTitleElement.style.opacity = '0';
        
        setTimeout(() => {
          categoryTitleElement.innerHTML = `<i class="bi bi-search me-2"></i>Kết quả tìm kiếm: "${searchTerm}"`;
          categoryTitleElement.style.opacity = '1';
        }, 200);
        
        // Bỏ chọn các danh mục
        document.querySelectorAll('#categoriesList .list-group-item').forEach(item => {
          item.classList.remove('active');
        });
        updateCategoryCounts(); // Cập nhật số lượng ghi chú trong danh mục
      }, 300);
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      showToast('Lỗi', 'Có lỗi xảy ra khi tìm kiếm ghi chú!', 'danger');
      loadNotes();
    }
  };
  
  // Thêm danh mục mới
  const addCategory = async () => {
    const categoryName = document.getElementById('categoryName').value.trim();
    
    if (!categoryName) {
      showToast('Thông báo', 'Tên danh mục là bắt buộc!', 'warning');
      document.getElementById('categoryName').focus();
      return;
    }
    
    // Hiển thị hiệu ứng đang lưu
    const saveBtn = document.getElementById('saveCategoryBtn');
    const originalBtnText = saveBtn.innerHTML;
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang lưu...';
    
    try {
      await api.createCategory(categoryName);
      categoryModal.hide();
      document.getElementById('categoryForm').reset();
      showToast('Thành công', 'Danh mục đã được tạo thành công!', 'success');
      loadCategories();
    } catch (error) {
      console.error('Lỗi khi thêm danh mục:', error);
      showToast('Lỗi', 'Có lỗi xảy ra khi thêm danh mục!', 'danger');
    } finally {
      // Khôi phục nút lưu
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalBtnText;
    }
  };
  
  // Sắp xếp ghi chú
  const sortNotes = async (field, order) => {
    if (state.sortField === field && state.sortOrder === order) return; // Không làm gì nếu đang sắp xếp như vậy rồi
    
    state.sortField = field;
    state.sortOrder = order;
    
    // Hiển thị thông báo đang sắp xếp
    showToast('Thông báo', 'Đang sắp xếp ghi chú...', 'info', 1000);
    
    loadNotes();
  };
  
  // Load danh sách ghi chú
  const loadNotes = async () => {
    try {
      notesList.innerHTML = `
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="mt-2">Đang tải ghi chú...</p>
        </div>
      `;
      
      const notes = await api.getNotes(
        state.currentCategoryId !== 'all' ? state.currentCategoryId : null, 
        state.sortField, 
        state.sortOrder
      );
      state.notes = notes;
      
      // Nếu đang hiển thị tất cả, cập nhật allNotes
      if (state.currentCategoryId === 'all') {
        state.allNotes = [...notes];
      }
      
      // Đợi một chút để hiển thị spinner
      setTimeout(() => {
        renderNotes(notes);
        updateCategoryCounts(); // Cập nhật số lượng ghi chú trong danh mục
      }, 300);
    } catch (error) {
      console.error('Lỗi khi tải ghi chú:', error);
      showToast('Lỗi', 'Có lỗi xảy ra khi tải danh sách ghi chú!', 'danger');
      notesList.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger">Đã xảy ra lỗi khi tải ghi chú. Vui lòng thử lại!</div>
        </div>
      `;
    }
  };
  
  // Load danh mục
  const loadCategories = async () => {
    try {
      const categories = await api.getCategories();
      state.categories = categories;
      renderCategories(categories);
      renderCategoriesTable(); // Cập nhật bảng danh mục
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
      showToast('Lỗi', 'Có lỗi xảy ra khi tải danh mục!', 'danger');
    }
  };
  
  // Hiển thị thông báo toast
  const showToast = (title, message, type = 'info', duration = 3000) => {
    // Tạo container cho toasts nếu chưa có
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '1060';
      document.body.appendChild(toastContainer);
    }
    
    // Tạo toast
    const toastId = `toast-${Date.now()}`;
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 bg-${type}`;
    toastEl.id = toastId;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.style.minWidth = '300px';
    
    // HTML cho toast
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body text-white">
          <strong>${title}:</strong> ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Đóng"></button>
      </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    // Khởi tạo toast Bootstrap
    const toast = new bootstrap.Toast(toastEl, {
      autohide: true,
      delay: duration
    });
    
    // Hiển thị toast
    toast.show();
    
    // Xóa toast khỏi DOM sau khi ẩn
    toastEl.addEventListener('hidden.bs.toast', () => {
      toastEl.remove();
    });
  };
  
  // Các hàm tiện ích
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Escape HTML để ngăn XSS
  const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };
  
  // Load danh sách ghi chú
  const loadAllNotes = async () => {
    try {
      const notes = await api.getNotes();
      state.allNotes = notes;
      state.notes = notes;
      return notes;
    } catch (error) {
      console.error('Lỗi khi tải tất cả ghi chú:', error);
      return [];
    }
  };

  // Hiển thị danh sách danh mục trong modal quản lý
  const renderCategoriesTable = () => {
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    const noCategoriesMessage = document.getElementById('noCategoriesMessage');
    
    if (!state.categories || state.categories.length === 0) {
      categoriesTableBody.innerHTML = '';
      noCategoriesMessage.classList.remove('d-none');
      return;
    }
    
    noCategoriesMessage.classList.add('d-none');
    categoriesTableBody.innerHTML = '';
    
    state.categories.forEach((category, index) => {
      // Đếm số lượng ghi chú trong danh mục
      const noteCount = state.allNotes.filter(note => note.category_id === category.id).length;
      
      // Không cho phép xóa danh mục mặc định "Khác" (id 6)
      const isDefaultCategory = category.id === 6;
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(category.name)}</td>
        <td><span class="badge bg-secondary">${noteCount}</span></td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1 edit-category-btn" data-id="${category.id}" ${isDefaultCategory ? 'disabled' : ''}>
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger delete-category-btn" data-id="${category.id}" ${isDefaultCategory ? 'disabled' : ''}>
            <i class="bi bi-trash"></i>
          </button>
        </td>
      `;
      
      categoriesTableBody.appendChild(row);
    });
    
    // Thêm sự kiện cho các nút chỉnh sửa
    document.querySelectorAll('.edit-category-btn').forEach(button => {
      button.addEventListener('click', () => {
        const categoryId = button.dataset.id;
        openEditCategoryModal(categoryId);
      });
    });
    
    // Thêm sự kiện cho các nút xóa
    document.querySelectorAll('.delete-category-btn').forEach(button => {
      button.addEventListener('click', () => {
        const categoryId = button.dataset.id;
        confirmDeleteCategory(categoryId);
      });
    });
  };
  
  // Mở modal chỉnh sửa danh mục
  const openEditCategoryModal = (categoryId) => {
    const category = state.categories.find(cat => cat.id == categoryId);
    if (!category) return;
    
    document.getElementById('editCategoryId').value = category.id;
    document.getElementById('editCategoryName').value = category.name;
    
    // Ẩn modal quản lý danh mục
    manageCategoriesModal.hide();
    
    // Hiển thị modal chỉnh sửa
    setTimeout(() => {
      editCategoryModal.show();
      
      // Focus vào trường tên danh mục sau khi modal hiển thị
      editCategoryModal._element.addEventListener('shown.bs.modal', function () {
        document.getElementById('editCategoryName').focus();
      }, { once: true });
    }, 500);
  };
  
  // Xác nhận xóa danh mục
  const confirmDeleteCategory = (categoryId) => {
    const category = state.categories.find(cat => cat.id == categoryId);
    if (!category) return;
    
    // Đếm số lượng ghi chú trong danh mục
    const noteCount = state.allNotes.filter(note => note.category_id == categoryId).length;
    
    if (confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"? ${noteCount > 0 ? `Có ${noteCount} ghi chú thuộc danh mục này sẽ được chuyển sang danh mục "Khác".` : ''}`)) {
      deleteCategory(categoryId);
    }
  };
  
  // Cập nhật danh mục
  const updateCategory = async () => {
    const categoryId = document.getElementById('editCategoryId').value;
    const categoryName = document.getElementById('editCategoryName').value.trim();
    
    if (!categoryName) {
      showToast('Thông báo', 'Tên danh mục là bắt buộc!', 'warning');
      document.getElementById('editCategoryName').focus();
      return;
    }
    
    // Hiển thị hiệu ứng đang lưu
    const updateBtn = document.getElementById('updateCategoryBtn');
    const originalBtnText = updateBtn.innerHTML;
    updateBtn.disabled = true;
    updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang cập nhật...';
    
    try {
      await api.updateCategory(categoryId, categoryName);
      editCategoryModal.hide();
      showToast('Thành công', 'Danh mục đã được cập nhật thành công!', 'success');
      
      // Cập nhật danh sách danh mục
      await loadCategories();
      
      // Mở lại modal quản lý danh mục
      setTimeout(() => {
        manageCategoriesModal.show();
      }, 500);
    } catch (error) {
      console.error('Lỗi khi cập nhật danh mục:', error);
      showToast('Lỗi', 'Có lỗi xảy ra khi cập nhật danh mục!', 'danger');
    } finally {
      // Khôi phục nút cập nhật
      updateBtn.disabled = false;
      updateBtn.innerHTML = originalBtnText;
    }
  };
  
  // Xóa danh mục
  const deleteCategory = async (categoryId) => {
    try {
      await api.deleteCategory(categoryId);
      showToast('Thành công', 'Danh mục đã được xóa thành công!', 'success');
      
      // Cập nhật danh sách danh mục
      await loadCategories();
      
      // Tải lại ghi chú nếu đang xem danh mục đã bị xóa
      if (state.currentCategoryId == categoryId) {
        state.currentCategoryId = 'all';
        await loadNotes();
      }
      
      // Cập nhật lại bảng quản lý danh mục
      renderCategoriesTable();
    } catch (error) {
      console.error('Lỗi khi xóa danh mục:', error);
      
      // Xử lý các mã lỗi có thể có
      if (error.response && error.response.status === 400) {
        showToast('Lỗi', 'Không thể xóa danh mục mặc định!', 'danger');
      } else {
        showToast('Lỗi', 'Có lỗi xảy ra khi xóa danh mục!', 'danger');
      }
    }
  };

  // Khởi tạo ứng dụng
  const init = async () => {
    // Load all notes first để có dữ liệu cho tất cả danh mục
    await loadAllNotes();
    
    // Load categories
    await loadCategories();
    
    // Load notes
    await loadNotes();
    
    // Add event listeners
    document.getElementById('newNoteBtn').addEventListener('click', openNewNoteModal);
    document.getElementById('saveNoteBtn').addEventListener('click', saveNote);
    
    // Sự kiện cho nút quản lý danh mục
    document.getElementById('manageCategoriesBtn').addEventListener('click', () => {
      renderCategoriesTable();
      manageCategoriesModal.show();
    });
    
    // Sự kiện cho nút thêm danh mục từ modal quản lý
    document.getElementById('addCategoryFromManagerBtn').addEventListener('click', () => {
      manageCategoriesModal.hide();
      setTimeout(() => {
        document.getElementById('categoryForm').reset();
        categoryModal.show();
        document.getElementById('categoryName').focus();
      }, 500);
    });
    
    // Sự kiện cho nút cập nhật danh mục
    document.getElementById('updateCategoryBtn').addEventListener('click', updateCategory);
    
    // Sự kiện cho nút xóa danh mục
    document.getElementById('deleteCategoryBtn').addEventListener('click', () => {
      const categoryId = document.getElementById('editCategoryId').value;
      if (categoryId) {
        confirmDeleteCategory(categoryId);
      }
    });
    
    // Sự kiện cho nút thêm danh mục
    document.getElementById('addCategoryBtn').addEventListener('click', () => {
      document.getElementById('categoryForm').reset();
      categoryModal.show();
      
      // Focus vào trường tên danh mục sau khi modal hiển thị
      categoryModal._element.addEventListener('shown.bs.modal', function () {
        document.getElementById('categoryName').focus();
      }, { once: true });
    });
    
    document.getElementById('saveCategoryBtn').addEventListener('click', addCategory);
    document.getElementById('searchButton').addEventListener('click', searchNotes);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchNotes();
      }
    });
    
    // Sort options
    document.querySelectorAll('.sort-option').forEach(option => {
      option.addEventListener('click', (e) => {
        e.preventDefault();
        sortNotes(option.dataset.sort, option.dataset.order);
      });
    });
    
    // Add delete button to note modal
    const modalFooter = document.querySelector('#noteModal .modal-footer');
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-danger me-auto';
    deleteButton.innerHTML = '<i class="bi bi-trash me-1"></i>Xóa';
    deleteButton.addEventListener('click', deleteNote);
    modalFooter.prepend(deleteButton);
    
    // Hiện delete button chỉ khi đang sửa ghi chú
    noteModal._element.addEventListener('show.bs.modal', () => {
      deleteButton.style.display = state.currentNote ? 'block' : 'none';
    });
    
    // Thêm phím tắt lưu
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && (noteModal._isShown || categoryModal._isShown || editCategoryModal._isShown)) {
        e.preventDefault();
        if (noteModal._isShown) {
          saveNote();
        } else if (categoryModal._isShown) {
          addCategory();
        } else if (editCategoryModal._isShown) {
          updateCategory();
        }
      }
    });
    
    // Xử lý sự kiện đóng modal chỉnh sửa danh mục
    const editCategoryModalEl = document.getElementById('editCategoryModal');
    editCategoryModalEl.addEventListener('hidden.bs.modal', () => {
      // Mở lại modal quản lý danh mục khi đóng modal chỉnh sửa
      if (!document.querySelector('.modal.show')) {
        setTimeout(() => {
          manageCategoriesModal.show();
        }, 300);
      }
    });
    
    // Hiển thị thông báo chào mừng
    setTimeout(() => {
      showToast('Chào mừng', 'Ứng dụng Ghi chú đã sẵn sàng!', 'primary', 2000);
    }, 1000);
  };
  
  // Khởi tạo ứng dụng khi tài liệu đã sẵn sàng
  init();
}); 