import React, {useState, useEffect, useRef} from 'react';

import logo from './logo.svg';
import './App.css';

const SECOND = 1000;
const MINUTE = 60*SECOND;
const HOUR = 60*MINUTE;
const DAY = 24*HOUR;

const KanbanBoard = ({children}) => {
  return (
    <main className='kanban-board'>
      {children}
    </main>
  );
};

const KanbanColumn = ({
  children,
  className,
  title,
  setIsDragSource = () => {},
  setIsDragTarget = () => {},
  dropCard = () => {}
}) => {
  const combinedClassName = `kanban-column ${className}`;
  return (
    <section
      onDragStart={() => setIsDragSource(true)}
      onDragOver={(evt) => {
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'move';
        setIsDragTarget(true);
      }}
      onDragLeave={(evt) => {
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'none';
        setIsDragTarget(false);
      }}
      onDrop={(evt) => {
        evt.preventDefault();
        dropCard();
      }}
      onDragEnd={(evt) => {
        evt.preventDefault();
        setIsDragSource(false);
        setIsDragTarget(false);
      }}
      className={combinedClassName}>
      <h2>{title}</h2>
      <ul>{children}</ul>
    </section>
  );
};

const KanbanCard = ({ title, status, onDragStart }) => {
  const [displayTime, setDisplayTime] = useState(status);
  useEffect(() => {
    const updateDisplayTime = () => {
      const timePassed = new Date() - new Date(status);
      let relativeTime = '刚刚';
      if (9*SECOND <= timePassed && timePassed < MINUTE) {
        relativeTime = `${Math.ceil(timePassed / SECOND)} 秒前`;
      } else if (MINUTE <= timePassed && timePassed < HOUR) {
        relativeTime = `${Math.ceil(timePassed / MINUTE)} 分钟前`;
      } else if (HOUR <= timePassed && timePassed < DAY) {
        relativeTime = `${Math.ceil(timePassed / HOUR)} 小时前`;
      } else if (DAY <= timePassed) {
        relativeTime = `${Math.ceil(timePassed / DAY)} 天前`;
      }
      setDisplayTime(relativeTime);
    };
    const intervalId = setInterval(updateDisplayTime, SECOND);
    updateDisplayTime();

    return () => {
      clearInterval(intervalId);
    };
  }, [status]);
  const handleDragStart = (evt) => {
    evt.dataTransfer.effectAllowed = 'move';
    evt.dataTransfer.setData('text/plain', title);
    onDragStart && onDragStart(evt);
  };

  return (
    <li className="kanban-card" draggable onDragStart={handleDragStart}>
      <div className="card-title">{title}</div>
      <div className="card-status" title={status}>{displayTime}</div>
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
  const inputElem = useRef(null);
  useEffect(() => {
    inputElem.current.focus();
  }, []);

  return (
    <li className="kanban-card">
      <h3>添加新卡片</h3>
      <div className="card-title">
        <input type='text' value={title} ref={inputElem}
          onChange={handleChange} onKeyDown={handleKeyDown} />
      </div>
    </li>
  );
};

const DATA_STORE_KEY = 'kanban-data-store';
const COLUMN_KEY_TODO = 'todo';
const COLUMN_KEY_ONGOING = 'ongoing';
const COLUMN_KEY_DONE = 'done';

function App() {
  const [showAdd, setShowAdd] = useState(false);
  const [todoList, setTodoList] = useState([]);
  const [ongoingList, setOngoingList] = useState([]);
  const [doneList, setDoneList] = useState([]);
  const [dragItem, setDragItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [dragTarget, setDragTarget] = useState(null);
  const handleAdd = (evt) => {
    setShowAdd(true);
  };
  const handleSubmit = (title) => {
    todoList.unshift({title, status: new Date().toString() });
    setShowAdd(false);
  };
  const todoTitle = (
    <>
      待处理<button onClick={handleAdd} disabled={showAdd}>&#8853; 添加新卡片</button>
    </>
  );

  const handleSaveAll = () => {
    const data = JSON.stringify({
      todoList,
      ongoingList,
      doneList
    })
    window.localStorage.setItem(DATA_STORE_KEY, data);
  };

  const dropCardItem = () => {
    if (dragSource !== dragTarget) {
      // remove from source list

      // add to target list
    }
  }

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const data = window.localStorage.getItem(DATA_STORE_KEY);
    setTimeout(() => {
      if (data) {
        const kanbanColumnData = JSON.parse(data);
        setTodoList(kanbanColumnData.todoList);
        setOngoingList(kanbanColumnData.ongoingList)
        setDoneList(kanbanColumnData.doneList);
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>核心工作<button onClick={handleSaveAll}>保存所有卡片</button></h1>
      </header>
      <KanbanBoard>
        {isLoading?(
          <KanbanColumn className="column-loading" title="读取中..."></KanbanColumn>
        ) : (<>
          <KanbanColumn className="column-todo" title={todoTitle}
            setIsDragSource={(isSrc) => setDragSource(isSrc? COLUMN_KEY_TODO: null)}
            setIsDragTarget={(isTgt) => setDragTarget(isTgt? COLUMN_KEY_TODO: null)}
            dropCard={dropCardItem}
          >
            { showAdd && <KanbanNewCard onSubmit={handleSubmit} /> }
            { todoList.map(props =>
              <KanbanCard key={props.title}
                onDragStart={() => setDragItem(props)}
                {...props}
              />)
            }
          </KanbanColumn>
          <KanbanColumn className="column-ongoing" title="进行中"
            setIsDragSource={(isSrc) => setDragSource(isSrc? COLUMN_KEY_ONGOING: null)}
            setIsDragTarget={(isTgt) => setDragTarget(isTgt? COLUMN_KEY_ONGOING: null)}
            dropCard={dropCardItem}
          >
            { ongoingList.map(props =>
              <KanbanCard key={props.title}
                onDragStart={() => setDragItem(props)}
                {...props}
              />)
            }
          </KanbanColumn>
          <KanbanColumn className="column-done" title="已完成"
            setIsDragSource={(isSrc) => setDragSource(isSrc? COLUMN_KEY_DONE: null)}
            setIsDragTarget={(isTgt) => setDragTarget(isTgt? COLUMN_KEY_DONE: null)}
            dropCard={dropCardItem}
          >
            { doneList.map(props =>
              <KanbanCard key={props.title}
                onDragStart={() => setDragItem(props)}
                {...props}
              />)
            }
          </KanbanColumn>
        </>)}
      </KanbanBoard>
    </div>
  );
}

export default App;
