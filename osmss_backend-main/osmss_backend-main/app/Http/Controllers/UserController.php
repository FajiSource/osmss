<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
class UserController extends Controller
{

    public function index(){
        try{
            $users = User::all();
            return response()->json([
                'message' => 'Users retrieved successfully',
                'users' => $users
            ]);
        }catch(\Exception $e){
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
    public function addUser(Request $request)
    {
        try{
            // {
            //     "firstname":"Admin",
            //     "lastname" : "Admin",
            //     "username" : "Admin",
            //     "role" : "ADMIN",
            //     "password": "osmmsadmin@2024"
            // }
            $validator = Validator::make($request->all(), [
                'firstname' => 'required',
                'lastname' => 'required',
                'username' => 'required',
                'role' => 'required',
                'password' => 'required'
            ]);
            if($validator->fails()){
                return response()->json(['message' => $validator->errors()->first()], 400);
            }
            $user = new User();
            $user->firstname = $request->firstname;
            $user->lastname = $request->lastname;
            $user->username = $request->username;
            $user->role = $request->role;
            $user->password = $request->password;
            $user->save();
            return response()->json([
                'message' => 'User added successfully',
                'user' => $user
            ]);
        }catch(\Exception $e){
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }

    public function updateUser(Request $request,$id){
        try{
            $validator = Validator::make($request->all(), [
                'firstname' => 'required',
                'lastname' => 'required',
                'username' => 'required',
                'role' => 'required',
            ]);

            if($validator->fails()){
                return response()->json(['message' => $validator->errors()->first()], 400);
            }

            $user = User::find($id);

            if(!$user){
                return response()->json(['message' => 'User not found'], 404);
            }
            $user->firstname = $request->firstname;
            $user->lastname = $request->lastname;
            $user->username = $request->username;
            $user->role = $request->role;
            $user->save();
            return response()->json([
                'message' => 'User updated successfully',
                'user' => $user
            ]);
        }catch(\Exception $e){
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
