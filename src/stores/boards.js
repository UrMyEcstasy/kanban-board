import {BASE_URL} from '@/constants'
import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import api from '../utils/axiosInstance'

export const useBoardsStore = defineStore('boards', () => {
    const boards = ref([])
    const isLoading = ref(false)

    const userId = localStorage.getItem('userId')
    const token = localStorage.getItem('token')

    const initBoards = async () => {
        isLoading.value = true;

        try {
            const response = await api.get(`/api/v1/user/${userId}/boards`)
            boards.value = response.data;
            isLoading.value = false;
        } catch (error) {
            console.log(error);
            isLoading.value = false;
        }
    }

    const createBoard = async (formData) => {
        axios.post(`${BASE_URL}/api/v1/user/${userId}/boards`, {
            "formData": formData
        }, {
            headers: {
                'X-Base-Auth': token
            }
        })
            .then(function () {
                initBoards();
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () {
                console.log('finally');
            });
    }

    const editBoard = async (boardId, formData) => {
        axios.put(`${BASE_URL}/api/v1/user/${userId}/boards/${boardId}`, {
            "formData": formData
        }, {
            headers: {
                'X-Base-Auth': token
            }
        })
            .then(function () {
                initBoards();
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () {
                console.log('finally');
            });
    }

    const deleteBoard = async (boardId) => {
        axios.delete(`${BASE_URL}/api/v1/user/${userId}/boards/${boardId}`, {
            headers: {
                'X-Base-Auth': token
            }
        })
            .then(function () {
                initBoards();
            })
            .catch(function (error) {
                console.log(error);
            })
            .finally(function () {
                console.log('finally');
            });
    }

    return {boards, initBoards, isLoading, createBoard, editBoard, deleteBoard}
})