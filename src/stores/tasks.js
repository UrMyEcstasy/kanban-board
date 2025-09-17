import {defineStore} from 'pinia'
import {ref} from 'vue'
import api from '@/utils/axiosInstance'

export const useTasksStore = defineStore('tasks', () => {
    const board = ref(null)
    const columns = ref([])
    const isLoading = ref(false)
    const tasksByStatus = ref([])

    const getUserId = () => {
        const userId = localStorage.getItem('userId')
        if (!userId) throw new Error('User ID not found')
        return userId
    }

    const initBoard = async (boardId) => {
        isLoading.value = true
        try {
            const userId = getUserId()
            const response = await api.get(`/api/v1/user/${userId}/boards/${boardId}`)
            board.value = response.data
            return response.data
        } catch (error) {
            console.error('Board loading error:', error)
            board.value = null
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const initColumns = async (boardId) => {
        isLoading.value = true
        try {
            const response = await api.get(`/api/v1/boards/${boardId}/statuses`)
            columns.value = response.data
            return columns.value
        } catch (error) {
            console.error('Columns loading error:', error)
            columns.value = []
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const initTasks = async (boardId) => {
        isLoading.value = true;
        try {
            const response = await api.get(`/api/v1/boards/${boardId}/tasks`);

            tasksByStatus.value = response.data.map(statusGroup => ({
                status: statusGroup.status,
                tasks: statusGroup.tasks.map(task => ({
                    id: task.id,
                    title: task.name,
                    description: task.description,
                    due_date: task.plannedCompletionAt,
                }))
            }));

            return tasksByStatus.value;
        } catch (error) {
            console.error('Tasks loading error:', error);
            tasksByStatus.value = [];
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    const createColumn = async (boardId, columnData) => {
        isLoading.value = true
        try {
            const response = await api.post(
                `/api/v1/boards/${boardId}/statuses`,
                {formData: columnData}
            )
            await initColumns(boardId)
            return response.data
        } catch (error) {
            console.error('Column creation error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const editColumn = async (boardId, columnId, taskData) => {
        isLoading.value = true;
        try {
            const payload = {
                formData: {
                    name: taskData.title.trim(),
                },
            };

            const response = await api.put(
                `/api/v1/boards/${boardId}/statuses/${columnId}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            await initColumns(boardId);
            return response.data;
        } catch (error) {
            console.error('Column editing error:', error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    };


    const deleteColumn = async (boardId, columnId) => {
        isLoading.value = true
        try {
            await api.delete(`/api/v1/boards/${boardId}/statuses/${columnId}`)
            await initColumns(boardId)
        } catch (error) {
            console.error('Column deletion error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    const createTask = async (boardId, currentColumnId, taskData) => {
        isLoading.value = true;
        try {
            const payload = {
                formData: {
                    statusId: currentColumnId,
                    name: taskData.title.trim(),
                    description: taskData.description || '',
                }
            };

            if (taskData.due_date) {
                const date = new Date(taskData.due_date);

                if (isNaN(date.getTime())) {
                    throw new Error(`Invalid date value: ${taskData.due_date}`);
                }

                payload.formData.plannedCompletionAt = date.toISOString();
            }

            console.log("Sending task data:", payload);

            const response = await api.post(
                `/api/v1/boards/${boardId}/tasks`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            await initTasks(boardId);
            return response.data;
        } catch (error) {
            console.error("Error creating task:", error.message);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    const editTask = async (boardId, currentColumnId, taskData) => {
        isLoading.value = true;
        try {
            const taskId = taskData.id;

            const payload = {
                formData: {
                    statusId: currentColumnId,
                    name: taskData.title.trim(),
                    description: taskData.description || '',
                }
            };

            if (taskData.due_date) {
                const date = new Date(taskData.due_date);
                payload.formData.plannedCompletionAt = date.toISOString();
            }

            const response = await api.put(
                `/api/v1/boards/${boardId}/tasks/${taskId}`,
                payload,
                {headers: {'Content-Type': 'application/json'}}
            );

            await initTasks(boardId);
            return response.data;
        } catch (error) {
            console.error("Error editing task:", error.message);
            throw error;
        } finally {
            isLoading.value = false;
        }
    }

    const deleteTask = async (boardId, taskId) => {
        isLoading.value = true
        try {
            await api.delete(`/api/v1/boards/${boardId}/tasks/${taskId}`)
            await initTasks(boardId)
        } catch (error) {
            console.error('Task deletion error:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }


    const moveTask = async (boardId, taskId, newColumnId) => {
        isLoading.value = true;
        try {
            let movedTask = null;
            tasksByStatus.value.forEach(statusGroup => {
                const taskIndex = statusGroup.tasks.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    [movedTask] = statusGroup.tasks.splice(taskIndex, 1);
                }
            });

            if (movedTask) {
                movedTask.statusId = newColumnId;
                const newStatusGroup = tasksByStatus.value.find(
                    group => group.status.id === newColumnId
                );
                if (newStatusGroup) {
                    newStatusGroup.tasks.push(movedTask);
                }
            }

            await api.patch(
                `/api/v1/boards/${boardId}/tasks/${taskId}`,
                {
                    formData: {
                        statusId: newColumnId
                    }
                },
                {headers: {"Content-Type": "application/json"}}
            );

        } catch (error) {
            console.error("Move error:", error);
            throw error;
        } finally {
            isLoading.value = false;
        }
    };


    const updateTaskStatus = (taskId, newStatusId) => {
        tasksByStatus.value.forEach(statusGroup => {
            const taskIndex = statusGroup.tasks.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
                statusGroup.tasks[taskIndex].statusId = newStatusId;
            }
        });
    }

    return {
        board,
        columns,
        isLoading,
        tasksByStatus,
        initBoard,
        initColumns,
        initTasks,
        createColumn,
        editColumn,
        deleteColumn,
        createTask,
        editTask,
        deleteTask,
        moveTask,
        updateTaskStatus
    }
})