import { motion } from 'framer-motion';
import { Plus, Search, FileText, TrendingUp, Users, Edit, Eye, Clock } from 'lucide-react';
import { useState } from 'react';

export default function SimpleBriefsPage() {
  const [showNewBriefForm, setShowNewBriefForm] = useState(false);
  const [briefTitle, setBriefTitle] = useState('');

  const handleCreateBrief = () => {
    if (briefTitle.trim()) {
      alert(`Creating brief: "${briefTitle}"`);
      setBriefTitle('');
      setShowNewBriefForm(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          className="text-center py-6 md:py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xl md:text-2xl font-semibold mb-3" style={{ color: '#ffffff' }}>
            Strategic Briefs
          </h1>
          <p className="text-sm md:text-base max-w-2xl mx-auto px-4 leading-relaxed" style={{ color: '#e2e8f0' }}>
            Create and manage your strategic intelligence briefs.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => setShowNewBriefForm(true)}
            className="p-4 flex items-center gap-3 cursor-pointer transition-all rounded-2xl hover:scale-105 hover:shadow-xl" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.15)', 
              backdropFilter: 'blur(30px)', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Plus className="w-5 h-5" style={{ color: '#ffffff' }} />
            <span className="font-medium" style={{ color: '#ffffff' }}>New Brief</span>
          </button>
          
          <div className="p-4 flex items-center gap-3 rounded-2xl" style={{ 
            background: 'rgba(255, 255, 255, 0.1)', 
            backdropFilter: 'blur(30px)', 
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <Search className="w-5 h-5" style={{ color: '#e2e8f0' }} />
            <input 
              type="text" 
              placeholder="Search briefs..."
              className="bg-transparent border-none outline-none text-white placeholder-white/60 w-48"
            />
          </div>
        </div>

        {/* New Brief Form Modal */}
        {showNewBriefForm && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowNewBriefForm(false)}
          >
            <motion.div 
              className="p-8 rounded-3xl max-w-md w-full mx-4"
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                backdropFilter: 'blur(40px)', 
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-6">Create New Strategic Brief</h3>
              <input
                type="text"
                value={briefTitle}
                onChange={(e) => setBriefTitle(e.target.value)}
                placeholder="Enter brief title..."
                className="w-full p-4 rounded-2xl bg-white/20 border border-white/30 text-white placeholder-white/60 outline-none focus:border-white/50 focus:bg-white/25 transition-all"
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreateBrief}
                  className="flex-1 py-3 px-6 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-medium transition-all"
                >
                  Create Brief
                </button>
                <button
                  onClick={() => setShowNewBriefForm(false)}
                  className="py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white/70 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <motion.div 
            className="p-6 text-center rounded-3xl cursor-pointer" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(40px)', 
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FileText className="w-10 h-10 mx-auto mb-4" style={{ color: '#ffffff' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Total Briefs</h3>
            <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>12</p>
            <p className="text-sm mt-2" style={{ color: '#e2e8f0' }}>+3 this week</p>
          </motion.div>
          
          <motion.div 
            className="p-6 text-center rounded-3xl cursor-pointer" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(40px)', 
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <TrendingUp className="w-10 h-10 mx-auto mb-4" style={{ color: '#ffffff' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Active Projects</h3>
            <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>5</p>
            <p className="text-sm mt-2" style={{ color: '#e2e8f0' }}>2 trending up</p>
          </motion.div>
          
          <motion.div 
            className="p-6 text-center rounded-3xl cursor-pointer" 
            style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(40px)', 
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Users className="w-10 h-10 mx-auto mb-4" style={{ color: '#ffffff' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>Team Members</h3>
            <p className="text-3xl font-bold" style={{ color: '#ffffff' }}>8</p>
            <p className="text-sm mt-2" style={{ color: '#e2e8f0' }}>All active</p>
          </motion.div>
        </div>

        {/* Recent Briefs */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6" style={{ color: '#ffffff' }}>Recent Strategic Briefs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Q4 Market Analysis", status: "Published", updated: "2 days ago" },
              { title: "Competitor Intelligence", status: "Draft", updated: "1 week ago" },
              { title: "Cultural Moments Report", status: "In Review", updated: "3 days ago" }
            ].map((brief, index) => (
              <motion.div
                key={index}
                className="p-6 cursor-pointer transition-all rounded-3xl group"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  backdropFilter: 'blur(40px)', 
                  border: '2px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: '0 30px 80px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.15)'
                }}
                onClick={() => alert(`Opening brief: ${brief.title}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>{brief.title}</h3>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 rounded-lg hover:bg-white/20">
                      <Edit className="w-4 h-4 text-white/70" />
                    </button>
                    <button className="p-1 rounded-lg hover:bg-white/20">
                      <Eye className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    brief.status === 'Published' ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/50' :
                    brief.status === 'Draft' ? 'bg-amber-500/30 text-amber-100 border border-amber-400/50' :
                    'bg-sky-500/30 text-sky-100 border border-sky-400/50'
                  }`}>
                    {brief.status}
                  </span>
                  <div className="flex items-center space-x-1 text-white/60">
                    <Clock className="w-3 h-3" />
                    <span>{brief.updated}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}