import React, {useState} from 'react';

import logo from './logo.svg';
import './App.css';

const todoList = [
  { title: '开发任务-1', status: '22-05-22 18:15' },
  { title: '开发任务-3', status: '22-05-22 18:15' },
  { title: '开发任务-5', status: '22-05-22 18:15' },
  { title: '测试任务-3', status: '22-05-22 18:15' }
];
const ongoingList = [
  { title: '开发任务-4', status: '22-05-22 18:15' },
  { title: '开发任务-6', status: '22-05-22 18:15' },
  { title: '测试任务-2', status: '22-05-22 18:15' }
];
const doneList = [
  { title: '开发任务-2', status: '22-05-22 18:15' },
  { title: '测试任务-1', status: '22-05-22 18:15' }
];

const KanbanCard = ({ title, status }) => {
  return (
    <li className="kanban-card">
      <div className="card-title">{title}</div>
      <div className="card-status">{status}</div>
    </li>
  );
};

const KanbanNewCard = ({ onSubmit }) => {
  const [title, setTitle] = useState("");
  const handleChange = (evt) => {
    setTitle(evt.target.value);
  };
  const handleKeyDown = (evt) => {
    if (evt.key === "Enter") {
      onSubmit(title);
    }
  };

  return (
    <li className="kanban-card">
      <h3>添加新卡片</h3>
      <div className="card-title">
        <input type='text' value={title} onChange={handleChange} onKeyDown={handleKeyDown} />
      </div>
    </li>
  );
};

function App() {
  const [showAdd, setShowAdd] = useState(false);
  const handleAdd = (evt) => {
    setShowAdd(true);
  };
  const handleSubmit = (title) => {
    todoList.unshift({title, status: new Date().toDateString() });
    setShowAdd(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>我的看板</h1>
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <main className='kanban-board'>
        <section className='kanban-column column-todo'>
          <h2>待处理<button onClick={handleAdd} disabled={showAdd}>&#8853; 添加新卡片</button></h2>
          <ul>
            { showAdd && <KanbanNewCard onSubmit={handleSubmit} /> }
            { todoList.map(props => <KanbanCard {...props} />) }
          </ul>
        </section>
        <section className='kanban-column column-ongoing'>
          <h2>进行中</h2>
          <ul>
            {
              ongoingList.map(KanbanCard)
            }
          </ul>
        </section>
        <section className='kanban-column column-done'>
          <h2>已完成</h2>
          <ul>
            {
              doneList.map(KanbanCard)
            }
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
