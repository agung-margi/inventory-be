import { Request, Response } from 'express'
import { createSessionValidation, createUserValidation, refreshSessionValidation } from './user.validator'
import { saveUserService, loginService, refreshTokenService, getUserById, getAllUserService } from './user.service'
import crypto from 'crypto'

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = createUserValidation(req.body)
    //   console.log(req.body)
    if (error) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: error.details[0].message
      })
    }
    // call saveUserService
    await saveUserService(value)

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: 'Registrasi Berhasil'
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const createSession = async (req: Request, res: Response) => {
  try {
    const { error, value } = createSessionValidation(req.body)
    if (error) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: error.details[0].message
      })
    }
    // call loginUser
    const result = await loginService(value)

    res.cookie('token', result.accessToken,{
      httpOnly:true,
      secure:false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2, // 1 hari
      path: '/'
    })

    const csrfToken = crypto.randomBytes(24).toString('hex');
    // set csrf token in cookie
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 2 // 1 hari
    })
    
    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'Login berhasil',
    })
  } catch (error) {
    res.status(422).json({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const refreshSession = async (req: Request, res: Response) => {
  try {
    const { error, value } = refreshSessionValidation(req.body)
    if (error) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: error.details[0].message
      })
    }
    // call refreshTokenService
    const result = await refreshTokenService(value.refreshToken)
    return res.status(200).send({
      status: true,
      statusCode: 200,
      message: 'Refresh session successful',
      data: {
        result
      }
    })
  } catch (error) {
    return res.status(422).send({
      status: false,
      statusCode: 422,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }
    
    const user = await getUserById(String(req.user.id));

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error in getMe:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUser = async (req: Request, res: Response) => {
  const { params: { id } } = req

  try {
    if(id) {
      const user = await getUserById(id);
      if(!user.data) {
        return res.status(404).json({
          status: false,
          statusCode: 404,
          message: 'User tidak ditemukan'
        })
      }
      res.status(200).json({
        status: true,
        statusCode: 200,
        message: 'User ditemukan',
        data: user
      })
    }

    const filters = {
nama: req.query.nama?.toString(),
      role: req.query.role?.toString(),
      kode_wh: req.query.kode_wh?.toString(),
      sortBy: req.query.sortBy as any,
      sortOrder: req.query.sortOrder as any,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10
    }

    const result = await getAllUserService(filters)

    if (result.data.length === 0) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: 'Item tidak ditemukan'
      })
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: result
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}