import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/api';
import Navbar from '../components/Navbar';
import BookModal from '../components/BookModal';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    tag: ''
  });
  const [loading, setLoading] = useState(true);
   const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [books, filters]);

  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = books;

    if (filters.status) {
      filtered = filtered.filter(book => book.status === filters.status);
    }

    if (filters.tag) {
      filtered = filtered.filter(book => 
        book.tags.some(tag => 
          tag.toLowerCase().includes(filters.tag.toLowerCase())
        )
      );
    }

    setFilteredBooks(filtered);
  };

  const handleAddBook = async (bookData) => {
    try {
      const response = await booksAPI.create(bookData);
      setBooks([response.data, ...books]);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleEditBook = async (bookData) => {
    try {
      const response = await booksAPI.update(editingBook._id, bookData);
      setBooks(books.map(book => 
        book._id === editingBook._id ? response.data : book
      ));
      setEditingBook(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.delete(bookId);
        setBooks(books.filter(book => book._id !== bookId));
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  const handleStatusChange = async (bookId, newStatus) => {
    try {
      const bookToUpdate = books.find(book => book._id === bookId);
      const updatedBookData = {
        ...bookToUpdate,
        status: newStatus
      };
      
      const response = await booksAPI.update(bookId, updatedBookData);
      setBooks(books.map(book => 
        book._id === bookId ? response.data : book
      ));
    } catch (error) {
      console.error('Error updating book status:', error);
    }
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBook(null);
  };

    const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate stats
  const stats = {
    total: books.length,
    wantToRead: books.filter(book => book.status === 'Want to Read').length,
    reading: books.filter(book => book.status === 'Reading').length,
    completed: books.filter(book => book.status === 'Completed').length,
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard">
 
      
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-header">
          <h1>  📚 Personal Book Manager</h1>
          <div className="user-section">
            <span>Welcome, {user?.name}</span>
            <button  onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-label">Total Books:</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-group">
            <div className="stat-item">
              <span className="stat-label">Want to read:</span>
              <span className="stat-value">{stats.wantToRead}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Reading:</span>
              <span className="stat-value">{stats.reading}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completed:</span>
              <span className="stat-value">{stats.completed}</span>
            </div>
          </div>
          <button 
            className="add-book-btn"
            onClick={() => setShowModal(true)}
          >
            Add Book
          </button>
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          {/* Sidebar Filters */}
          <div className="sidebar">
            <div className="filter-section">
              <h3>Filter</h3>
              <div className="filter-options">
                <label>
                  <input 
                    type="checkbox" 
                    checked={filters.status === 'Completed'}
                    onChange={(e) => setFilters({
                      ...filters, 
                      status: e.target.checked ? 'Completed' : ''
                    })}
                  />
                  Completed
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={filters.status === 'Want to Read'}
                    onChange={(e) => setFilters({
                      ...filters, 
                      status: e.target.checked ? 'Want to Read' : ''
                    })}
                  />
                  Want to Read
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={filters.status === 'Reading'}
                    onChange={(e) => setFilters({
                      ...filters, 
                      status: e.target.checked ? 'Reading' : ''
                    })}
                  />
                  Reading
                </label>
              </div>
              <div className="tag-filter">
                <label>Tag filter (input or select)</label>
                <input
                  type="text"
                  placeholder="Enter tag..."
                  value={filters.tag}
                  onChange={(e) => setFilters({...filters, tag: e.target.value})}
                  className="tag-input"
                />
              </div>
            </div>
          </div>

          {/* Books Table */}
          <div className="books-table-container">
            <table className="books-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Tags</th>
                  <th>Status (changeable)</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="no-books">
                      No books found. Add your first book to get started!
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book._id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        {book.tags.length > 0 ? book.tags.join(', ') : '-'}
                      </td>
                      <td>
                        <select
                          value={book.status}
                          onChange={(e) => handleStatusChange(book._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="Want to Read">Want to Read</option>
                          <option value="Reading">Reading</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => openEditModal(book)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <BookModal
          book={editingBook}
          onSave={editingBook ? handleEditBook : handleAddBook}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
