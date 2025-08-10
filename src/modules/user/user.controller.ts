import { Request, Response } from 'express'
import { createSessionValidation, createUserValidation, refreshSessionValidation } from './user.validator'
import { saveUserService, loginService, refreshTokenService, getUserById } from './user.service'
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
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 2 // 1 hari
    })

    const csrfToken = crypto.randomBytes(24).toString('hex');
    // set csrf token in cookie
    res.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
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