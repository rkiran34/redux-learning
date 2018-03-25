// Passing store down explicitly via props.
// THis is helpful while unit testing so a mock store can be passed during testing.

const todo = (state, action) => 
{
  switch(action.type) {
    case 'ADD_TODO':
      return {
        id: action.id,
        text: action.text,
        completed: false
      };
    case 'TOGGLE_TODO':
      if (state.id === action.id) {
        return {...state, completed: !state.completed }
      } else {
        return state;
      }
    default: 
      return state;
  }
}

const todos = (state = [], action) => {
  switch(action.type) {
    case 'ADD_TODO':
      // reducer composition - calling reducer from another
      return [...state, todo(undefined, action)];
    case 'TOGGLE_TODO':
      return state.map(s => todo(s, action));
    default:
      return state;
  }
};

const visibilityFilter = (
  state = 'SHOW_ALL', 
  action
) => {
  switch (action.type)
  {
    case 'SET_VISIBILITY_FILTER':
      return action.filter;
    default:
      return state;
  }
};

const { combineReducers } = Redux;
const todoApp = combineReducers({
  todos: todos,
  visibilityFilter: visibilityFilter
});

const { Component } = React;

const Link = ({
  active,
  children,
  onClick
}) => {
  if(active) {
    return <span>{children}</span>
  }
  return (
    <a href='#'
      onClick={e => {
      e.preventDefault();
      onClick(); 
    }}
    >
      {children}
    </a>
  );
};


// Container component
class FilterLink extends Component {
  
	componentDidMount() {
		const { store } = this.props;
		this.unsubscribe = store.subscribe(() =>
			this.forceUpdate()
		);
	}
	  
	componentWillUnmount() {
		this.unsubscribe();
	}
	  
  render() {
    const props = this.props;
	const { store } = props;
    const state = store.getState();
    
    return (
      <Link
        active={
          props.filter ===
          state.visibilityFilter
        }
        onClick={() => 
          store.dispatch({
            type: 'SET_VISIBILITY_FILTER',
            filter: props.filter
          })
        }
      >
        {props.children}
      </Link>
    );
  }
}

const Footer = ({ store }) => (
        <p>
          Show:
          {' '}
          <FilterLink
            filter='SHOW_ALL'
			store={store}
			>
            All
          </FilterLink>
            {' '}
          <FilterLink
            filter='SHOW_ACTIVE'
			store={store}
			>
            Active
          </FilterLink>
            {' '}
          <FilterLink
            filter='SHOW_COMPLETED'
			store={store}
			>
                Completed
          </FilterLink>
            {' '}
        </p>
)

// This is a presentational component
const Todo = ({
  onClick,
  completed,
  text
}) => (
	<li
	  onClick={onClick}
	style={{
	  textDecoration:
		   completed 
		   ? 'line-through'
		   : 'none'
	}}>
		{text}
	</li>
);

// another presentational component
const TodoList = ({
  todos,
  onTodoClick
}) => (
  <ul>
    {todos.map(todo => 
       <Todo
         key={todo.id}
          {...todo}
          onClick={() => onTodoClick(todo.id)}
      />
     )}
  </ul>
);

// functional component
const AddTodo = ({ store }) => {
  let input;
  
  return (
	  <div>
		<input 
		  ref={node => {
		  input = node;
		  }} />
		<button onClick={() => {
            store.dispatch({
              type: 'ADD_TODO',
              id: nextTodoId++,
              text: input.value
            })
			input.value = '';
		  }}>
		  Add Todo
		</button>
	  </div>
  );
};

const getVisibleTodos = (
  todos, filter
) => {
  switch(filter) {
    case 'SHOW_ALL':
      return todos;
    case 'SHOW_COMPLETED':
      return todos.filter(t => t.completed);
    case 'SHOW_ACTIVE':
      return todos.filter(t => !t.completed);
  }
}


/* the job of a container component is to connect 
	the presentational component to the Redux store */
class VisibleTodoList extends Component {
	
	componentDidMount() {
		const { store } = this.props;
		this.unsubscribe = store.subscribe(() =>
		  this.forceUpdate()
		);
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	render() {
		const props = this.props
		const { store } = props;
		const state = store.getState();
		
		return (
			<TodoList
				todos = {
					getVisibleTodos(
						state.todos,
						state.visibilityFilter
						)
				}
				onTodoClick={id => 
					store.dispatch({
						type: 'TOGGLE_TODO',
						id
					})
				}
			/>
		);
	}
}


let nextTodoId = 0;

// Container component
const TodoApp = ({ store }) => 
(
	<div>
		<AddTodo store={store} />
		<VisibleTodoList store={store} />
		<Footer store={store} />
	</div>
);

  
const { createStore } = Redux;

ReactDOM.render(
	<TodoApp 
		store={ createStore(todoApp) }/>,
	document.getElementById('root')
);

store.subscribe(render);
render();