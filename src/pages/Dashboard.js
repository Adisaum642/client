import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/api';
import Navbar from '../components/Navbar';
import BookModal from '../components/BookModal';
import BookTable from '../components/BookTable';
import BookStats from '../components/BookStats';

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

  const openEditModal = (book) => {
    setEditingBook(book);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBook(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <BookStats books={books} />
          
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  My Books
                </h3>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add New Book
                </button>
              </div>
              
              <div className="mt-4 flex space-x-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="Want to Read">Want to Read</option>
                  <option value="Reading">Reading</option>
                  <option value="Completed">Completed</option>
                </select>
                
                <input
                  type="text"
                  placeholder="Filter by tag..."
                  value={filters.tag}
                  onChange={(e) => setFilters({...filters, tag: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <BookTable
              books={filteredBooks}
              onEdit={openEditModal}
              onDelete={handleDeleteBook}
            />
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
