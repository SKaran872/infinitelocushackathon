import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FileText, Plus, X, Bell } from "lucide-react";

export default function Dashboard() {
  const { user, logout, api } = useContext(AuthContext);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Messages State
  const [messages, setMessages] = useState([]);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const messagesRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    
    const fetchDocuments = async () => {
      try {
        const res = await api.get("/documents");
        if (isMounted) {
          setDocuments(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch documents", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const fetchMessages = async () => {
      try {
        const res = await api.get("/auth/messages");
        if (isMounted) {
          setMessages(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        if (isMounted) {
          setMessagesLoading(false);
        }
      }
    };

    fetchDocuments();
    fetchMessages();

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setIsMessagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      isMounted = false; 
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [api]);

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await api.post("/documents", { 
        title: newTitle, 
        description: newDesc 
      });
      setIsModalOpen(false);
      navigate(`/documents/${res.data._id}`);
    } catch (err) {
      console.error(err);
      setIsCreating(false);
    }
  };

  const openModal = () => {
    setNewTitle("");
    setNewDesc("");
    setIsModalOpen(true);
  };

  const deleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageClick = async (message) => {
    setIsMessagesOpen(false);
    if (!message.isRead) {
      try {
        await api.put(`/auth/messages/${message._id}/read`);
        setMessages((prev) => 
          prev.map((m) => m._id === message._id ? { ...m, isRead: true } : m)
        );
      } catch (err) {
        console.error("Error marking message specifically as read", err);
      }
    }
    navigate(`/documents/${message.documentId}`);
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Document</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateDocument} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Project Proposal"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="What is this document about?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows="3"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-t-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.username}</p>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Messages Dropdown */}
            <div className="relative" ref={messagesRef}>
              <button
                onClick={() => setIsMessagesOpen(!isMessagesOpen)}
                className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isMessagesOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden divide-y divide-gray-100">
                  <div className="px-4 py-3 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{unreadCount} New</span>
                  </div>
                  
                  <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
                    {messagesLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <Bell className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">You have no notifications</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <button
                          key={message._id}
                          onClick={() => handleMessageClick(message)}
                          className={`w-full text-left p-4 hover:bg-blue-50/50 transition-colors flex gap-3 ${
                            !message.isRead ? "bg-blue-50/30" : "opacity-70"
                          }`}
                        >
                          <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!message.isRead ? "bg-blue-600" : "bg-transparent"}`}></div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm text-gray-900 font-medium line-clamp-2 leading-snug">
                              <span className="font-semibold text-blue-800">{message.senderName}</span>{" "}
                              shared the document{" "}
                              <span className="font-semibold">"{message.documentTitle || "Untitled"}"</span>{" "}
                              with you.
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
                              {new Date(message.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="bg-gray-50 px-4 py-2 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">Notifications shown from past activity</p>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-gray-200"></div>

            <button
              onClick={logout}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Log out
            </button>
          </div>
        </header>

        <main>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Your Documents</h2>
            <button
              onClick={openModal}
              className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Document
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {documents.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-16 text-center bg-white">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No documents yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new document to begin collaborating.</p>
                <button
                  onClick={openModal}
                  className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Create First Document
                </button>
              </div>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc._id}
                  className="flex flex-col justify-between overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200 transition-all hover:shadow-lg hover:-translate-y-1"
                >
                  <Link to={`/documents/${doc._id}`} className="block p-6 flex-1 hover:bg-gray-50/50 transition-colors">
                    <div className="flex flex-col h-full gap-4">
                      <div className="rounded-lg bg-blue-50 w-12 h-12 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="mt-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {doc.title || "Untitled Document"}
                        </h3>
                        {doc.description && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-400 font-medium">
                          Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-3 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(doc._id);
                      }}
                      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
