/*
	Container components must subscribe to the store when they are created so they can get updated when store changes
	They should also unsubscribe when they are unmounted (to avoid memory leaks)
	they use current state of store and udpate presentational components
	
	Add mapStateToProps and mapDispatchToProps for all container components
	
*/



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
		const { store } = this.context;
		this.unsubscribe = store.subscribe(() =>
			this.forceUpdate()
		);
	}
	  
	componentWillUnmount() {
		this.unsubscribe();
	}
	  
  render() {
    const props = this.props;
	const { store } = this.context;
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
FilterLink.contextTypes = {
	store: React.PropTypes.object
};

const Footer = () => (
        <p>
          Show:
          {' '}
          <FilterLink
            filter='SHOW_ALL'
			>
            All
          </FilterLink>
            {' '}
          <FilterLink
            filter='SHOW_ACTIVE'
			>
            Active
          </FilterLink>
            {' '}
          <FilterLink
            filter='SHOW_COMPLETED'
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

const mapDispatchToAddTodoProps = (state) => {
	return {
		onClick: (text) => {
			store.dispatch({
				type: 'ADD_TODO',
				id: nextTodoId++,
				text
			});
		}
	};
}

const { connect } = ReactRedux;

// functional component
const AddTodo = connect(
	null,
	mapDispatchToAddTodoProps
)();

const AddTodo = (props, { store }) => {
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
AddTodo.contextTypes = {
	store: React.PropTypes.object
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

const mapStateToTodoListProps = (state) => {
	return {
		todos: getVisibleTodos(
			state.todos,
			state.visibilityFilter
		)
	};
};

const mapDispatchToTodoListProps = (dispatch) => {
	return {
		onTodoClick: (id) => { 
			dispatch({
				type: 'TOGGLE_TODO',
				id
			})
		}
	};
};

/* the job of a container component is to connect 
	the presentational component to the Redux store 
	In this case the presentational component TodoList is connected using the connect function from ReactRedux
*/
const VisibleTodoList = connect(
	mapStateToTodoListProps,
	mapDispatchToTodoListProps
)(TodoList);

let nextTodoId = 0;

// Container component
const TodoApp = () => 
(
	<div>
		<AddTodo />
		<VisibleTodoList />
		<Footer />
	</div>
);

const { createStore } = Redux;
const { Provider } = ReactRedux;

/* Provider component will use React advanced Context feature to make store available for any component within Provider component */
ReactDOM.render(
	<Provider store={ createStore(todoApp) }>
		<TodoApp />
	</Provider>,
	document.getElementById('root')
);

