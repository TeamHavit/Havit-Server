# Havit-Server  
### 기억하고 싶은 모든 콘텐츠를 내 손 안에, HAVIT

![image](https://user-images.githubusercontent.com/20807197/148192962-6206fce8-ee3f-437d-9475-f67256819195.png)


> 쉽고 빠르게 콘텐츠를 저장하고 카테고라이징하며    
지식을 놓치지 않도록 리마인드 해줄 수 있는 지식 아카이빙 앱   
해빗이 여러분의 성장과 함께 합니다.

> SOPT 29th APPJAM </b>
>
> 프로젝트 기간: 2022.01.02 ~ 2022.01.22

### 📋 IA   
![image](https://user-images.githubusercontent.com/20807197/148189262-1dec5ee4-e543-4822-b930-e796ef405863.png)

### 💡 API 명세서
(추가 예정)

### 📑 ERD
(추가 예정)

### 🛠 Development Environment   
<img src="https://img.shields.io/badge/Node.js-v16-green"/> <img src="https://img.shields.io/badge/PostgreSQL-v12.5-blue"/> <img src="https://img.shields.io/badge/Express-v4.17.2-green"/> <img src="https://img.shields.io/badge/Javascript-es6-yellow"/> <img src="https://img.shields.io/badge/firebase-yellow"/>  

### 📁 Foldering

```

📁 functions _ 
            |_ 📁 api _ 
            |         |_ 📋 index.js
            |         |_ 📁 routes _
            |                      |_ 📋 index.js
            |                      |_ 📁 auth 
            |			   |_ 📁 user
            |                      |_ 📁 content           
            |                      |_ 📁 category
	    |                      |_ 📁 recommendation
	    |                      |_ 📁 notification
            |
            |_ 📁 constants _ 
            |               |_ 📋responseMessage.js
            |               |_ 📋 statusCode.js
            |
            |_ 📁 lib _ 
            |	      |_ 📋 util.js
            |
            |_ 📁 db _
                      |_ 📋 index.js
                      |_ 📋 db.js
                      |_ 📋 user.js
                      |_ 📋 category.js
		      |_ 📋 content.js
		      |_ 📋 category_content.js
		      |_ 📋 notification.js
		      |_ 📋 recommendation.js
		      |_ 📋 category_image.js

```

### 📌 담당 API 및 구현 진척도

| 기능명 | 담당자 | 완료 여부 |
| :-----: | :---: | :---: |
| 카카오 로그인 | `주효식` |  |
| 마이페이지 조회 | `주효식` |  |
| 스크랩 | `주효식` |  |
| 콘텐츠 생성 | `주효식` |  |
| 콘텐츠 조회 여부 토글 | `주효식` |  |
| 전체 콘텐츠 조회 | `주효식` |  |
| 전체 콘텐츠 검색 | `주효식` |  |
| 콘텐츠 카테고리 이동 | `주효식` |  |
| 최근 저장 콘텐츠 조회 | `주효식` |  |
| 봐야 하는 콘텐츠 조회 | `채정아` |  |
| 콘텐츠 삭제 | `주효식` |  |
| 콘텐츠 제목 변경 | `주효식` |  |
| 추천 사이트 조회 | `채정아` |  |
| 카테고리 전체 조회 | `채정아` |  |
| 카테고리 생성 | `채정아` |  |
| 카테고리 수정 | `채정아` |  |
| 카테고리 삭제 | `채정아` |  |
| 카테고리 별 콘텐츠 조회 | `채정아` |  |
| 카테고리 이름 조회 | `채정아` |  |
| 카테고리 별 콘텐츠 검색 | `채정아` |  |
| 카테고리 아이콘 이미지 조회 | `채정아` |  |
| 카테고리 순서 변경 | `채정아` |  |
| 알림 전체 조회 | `채정아` |  |
| 알림 수정 | `채정아` |  |
| 알림 삭제 | `채정아` |  |


### 📌 Branch Strategy

<details>
<summary>Git Workflow</summary>
<div markdown="1">       

```
 1. local - feature에서 각자 기능 작업
 2. 작업 완료 후 local - develop (ex. jobchae) 에 PR 후 Merge
 3. 이후 remote - develop 으로 PR
 4. 코드 리뷰 후 Confirm 받고 Merge
 5. remote - develop 에 Merge 될 때 마다 모든 팀원 remote - develop pull 받아 최신 상태 유지
 ```

</div>
</details>


| Branch Name | 설명 |
| :---: | :-----: |
| main | 초기 세팅 존재 |
| develop | 로컬 develop merge 브랜치 |
| philip | 효식 로컬 develop 브랜치 |
| jobchae | 정아 로컬 develop 브랜치 |
| localdevelop/#issue | 각자 기능 추가 브랜치 |

### 📌 Commit Convention

##### [TAG] 메시지 

| 태그 이름  |                             설명                             |
| :--------: | :----------------------------------------------------------: |
|  [CHORE]   |                  코드 수정, 내부 파일 수정                   |
|   [FEAT]   |                       새로운 기능 구현                       |
|   [ADD]    | FEAT 이외의 부수적인 코드 추가, 라이브러리 추가, 새로운 파일 생성 |
|  [HOTFIX]  |             issue나 QA에서 급한 버그 수정에 사용             |
|   [FIX]    |                       버그, 오류 해결                        |
|   [DEL]    |                     쓸모 없는 코드 삭제                      |
|   [DOCS]   |                 README나 WIKI 등의 문서 개정                 |
| [CORRECT]  |       주로 문법의 오류나 타입의 변경, 이름 변경에 사용       |
|   [MOVE]   |               프로젝트 내 파일이나 코드의 이동               |
|  [RENAME]  |                파일 이름 변경이 있을 때 사용                 |
| [IMPROVE]  |                     향상이 있을 때 사용                      |
| [REFACTOR] |                   전면 수정이 있을 때 사용                   |

### 📌 Coding Convention

<details>
<summary>변수명</summary>   
<div markdown="1">       
      
 
 1. Camel Case 사용 
   - lower Camel Case
 2. 함수의 경우 동사+명사 사용 
   - ex) getInformation()
 3. flag로 사용 되는 변수는 조동사 + flag 종류로 구성 
   - ex) isNum
 4. 약어는 되도록 사용하지 않는다.
   - 부득이하게 약어가 필요하다고 판단되는 경우 팀원과 상의를 거친다.
 
</div>
</details>

<details>
<summary>주석</summary>
<div markdown="1">       

 1. 한줄 주석은 // 를 사용한다.
  ```javascript
    // 한줄 주석일 때
    /**
    * 여러줄
    * 주석일 때
    */
  ```
 2. 함수에 대한 주석
  ```javascript
    /**
    * api get /travel/:groupNumber
    * 그룹 여행 정보 가져오기
  ```
 3. Bracket 사용 시 내부에 주석을 작성한다.
  ```javascript
    if (a == 5) {
	  // 주석
    }
  ```
 
</div>
</details>

<details>
<summary>Bracket</summary>
<div markdown="1">       

 1. 한줄 if 문은 여러 줄로 작성한다. 
  
 ``` javascript
 // 한줄 if 문 - 여러 줄로 작성
  if(trigger) {
    return;
  }
 ```
  2. 괄호는 한칸 띄우고 사용한다. 
  
 ``` javascript 
 // 괄호 사용 한칸 띄우고 사용한다.
  if (left == true) {
     return;
  }
 ```
  3. Bracket 양쪽 사이를 띄어서 사용한다.
 ``` javascript 
 // 띄어쓰기
  if (a == 5) { // 양쪽 사이로 띄어쓰기
     return;  
  }
 ```
 
</div>
</details>

<details>
<summary>비동기 함수의 사용</summary>
<div markdown="1">       

 1. async, await 함수 사용을 지향한다.
 2. Promise 사용은 지양한다.
 3. 다만 로직을 짜는 데 있어 promise를 불가피하게 사용할 경우, 주석으로 표시하고 commit에 그 이유를 작성한다.
 
</div>
</details>

### 👩🏻‍💻 Developers   
| 주효식 | 채정아 |
| :---: | :---: | 
|<img src="https://user-images.githubusercontent.com/20807197/148191139-a4dc7ea2-2c19-4407-bb15-dce9e5393da8.png" width="200px" height="200px" />|<img src ="https://user-images.githubusercontent.com/20807197/148191319-60ee8fcb-71c4-496b-99f5-faa1d70f6408.png" width = "200px" height="200px" />|
|[HYOSITIVE](https://github.com/HYOSITIVE)|[jokj624](https://github.com/jokj624)| 

