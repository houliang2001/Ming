import prisma from '../lib/prisma.js'

export async function recordAiLog(moduleType, success, errorMessage = null) {
  try {
    await prisma.aiLog.create({
      data: {
        moduleType,
        success,
        errorMessage: errorMessage ? String(errorMessage).slice(0, 2000) : null,
      },
    })
  } catch (error) {
    console.error('Failed to write AI log', error)
  }
}
