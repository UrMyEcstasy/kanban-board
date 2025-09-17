import {defineStore} from 'pinia'
import {ref} from 'vue'
import axios from 'axios'
import {BASE_URL} from '@/constants.js'

export const useAdminStore = defineStore('admins', () => {
    const users = ref([])
    const loading = ref(false)
    const error = ref(null)

    const userPermissions = ref({})

    const getAuthToken = () => {
        const token = localStorage.getItem('token')
        if (!token) {
            error.value = 'Authentication token not found'
            throw new Error('Authentication token not found')
        }
        return token
    }

    const searchUsers = async (email) => {
        const token = getAuthToken()
        const response = await axios.get(`${BASE_URL}/api/v1/users/match`, {
            params: {email},
            headers: {'X-Base-Auth': token},
        })
        return response.data.items || []
    }

    const fetchUsers = async (boardId) => {
        try {
            loading.value = true
            error.value = null
            const token = getAuthToken()

            const response = await axios.get(
                `${BASE_URL}/api/v1/boards/${boardId}/users`,
                {headers: {'X-Base-Auth': token}}
            )
            users.value = response.data
        } catch (err) {
            error.value = err.response?.data?.detail || err.message || 'Loading error'
            users.value = []
        } finally {
            loading.value = false
        }
    }

    const addUsersToBoard = async (boardId, userIds) => {
        try {
            loading.value = true
            error.value = null
            const token = getAuthToken()

            const payload = {
                formData: {ids: Array.isArray(userIds) ? userIds : [userIds]}
            }

            console.log('[addUsersToBoard] payload:', payload)

            await axios.post(
                `${BASE_URL}/api/v1/boards/${boardId}/users`,
                payload,
                {headers: {'X-Base-Auth': token}}
            )
            await fetchUsers(boardId)
        } catch (err) {
            console.error('[addUsersToBoard] error:', err.response?.data || err.message)
            error.value = err.response?.data?.detail || err.message || 'Adding error'
            throw err
        } finally {
            loading.value = false
        }
    }


    const removeUserFromBoard = async (boardId, userId) => {
        try {
            loading.value = true
            error.value = null
            const token = getAuthToken()

            await axios.delete(
                `${BASE_URL}/api/v1/boards/${boardId}/users/${userId}`,
                {headers: {'X-Base-Auth': token}}
            )
            await fetchUsers(boardId)
        } catch (err) {
            error.value =
                err.response?.data?.detail || err.message || 'Delete error'
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchMyPermissionsForBoards = async (boards, myId) => {
        try {
            const token = getAuthToken()

            for (const board of boards) {
                const response = await axios.get(
                    `${BASE_URL}/api/v1/boards/${board.id}/users/${myId}/permissions`,
                    {headers: {'X-Base-Auth': token}}
                )

                if (!userPermissions.value[board.id]) {
                    userPermissions.value[board.id] = {}
                }
                userPermissions.value[board.id][myId] = response.data
            }
        } catch (err) {
            console.error("fetchMyPermissionsForBoards error:", err)
        }
    }


    const fetchPermissions = async (boardId, userId) => {
        try {
            const token = getAuthToken()
            const response = await axios.get(
                `${BASE_URL}/api/v1/boards/${boardId}/users/${userId}/permissions`,
                {headers: {'X-Base-Auth': token}}
            )

            if (!userPermissions.value[boardId]) {
                userPermissions.value[boardId] = {}
            }
            userPermissions.value[boardId][userId] = response.data
        } catch (err) {
            error.value =
                'permission error: ' + (err.response?.data?.detail || err.message)

            if (!userPermissions.value[boardId]) {
                userPermissions.value[boardId] = {}
            }
            userPermissions.value[boardId][userId] = []
            throw err
        }
    }


    const grantPermission = async (boardId, userId, permission) => {
        const token = getAuthToken()
        await axios.put(
            `${BASE_URL}/api/v1/boards/${boardId}/users/${userId}/permissions/${permission}`,
            null,
            {
                headers: {'X-Base-Auth': token},
                transformResponse: r => r
            }
        ).then(() => {
            console.log(`[grantPermission] ${permission} granted to user ${userId}`)
        }).catch(err => {
            console.error(`[grantPermission] error:`, err.response?.data || err.message)
        })
    }

    const revokePermission = async (boardId, userId, permission) => {
        const token = getAuthToken()
        await axios.delete(
            `${BASE_URL}/api/v1/boards/${boardId}/users/${userId}/permissions/${permission}`,
            {headers: {'X-Base-Auth': token}}
        ).then(() => {
            console.log(`[revokePermission] ${permission} revoked from user ${userId}`)
        }).catch(err => {
            console.error(`[revokePermission] error:`, err.response?.data || err.message)
        })
    }


    return {
        users,
        loading,
        error,
        userPermissions,
        fetchUsers,
        addUsersToBoard,
        removeUserFromBoard,
        fetchPermissions,
        fetchMyPermissionsForBoards,
        grantPermission,
        revokePermission,
        searchUsers,
    }
})

export const PERMISSIONS = {
    'delete-board': 'Delete boards',
    'delete-board-statuses': 'Delete statuses',
    'manage-board': 'Changing boards',
    'manage-board-statuses': 'Changing statuses',
    'manage-board-users': 'Changing users',
}
