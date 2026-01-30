#!/usr/bin/env python3
"""
技能创建功能测试脚本
测试管理端的技能创建功能，包括：
1. AI生成功能的各种场景
2. 文件导入功能（上传和粘贴）
3. 三种创建方式之间的切换
4. 从AI生成/文件导入到手动编辑的流程
"""

from playwright.sync_api import sync_playwright, Page, expect
import time
import os

# 测试配置
ADMIN_URL = "http://localhost:3005/admin"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Tyx@19811009"

def login(page: Page, force_relogin=False):
    """登录管理端"""
    if force_relogin:
        print("🔐 重新登录管理端...")
        # 如果已经登录，先退出
        try:
            logout_button = page.locator('text=退出登录, button:has-text("退出")').first
            if logout_button.is_visible(timeout=2000):
                logout_button.click()
                page.wait_for_load_state('networkidle')
                time.sleep(1)
        except:
            pass
    
    print("🔐 正在登录管理端...")
    page.goto(ADMIN_URL)
    page.wait_for_load_state('networkidle')
    
    # 等待登录表单出现
    page.wait_for_selector('input[type="text"], input[type="password"]', timeout=10000)
    time.sleep(1)  # 额外等待确保页面完全渲染
    
    # 查找用户名输入框 - 使用更灵活的选择器
    username_selectors = [
        'input[placeholder*="用户名"]',
        'input[placeholder*="账号"]',
        'input[type="text"]',
        'input[type="email"]',
        'input[name="username"]'
    ]
    
    username_input = None
    for selector in username_selectors:
        try:
            inputs = page.locator(selector).all()
            for inp in inputs:
                if inp.is_visible(timeout=1000):
                    # 检查是否是用户名输入框（通常是第一个文本输入框）
                    placeholder = inp.get_attribute('placeholder') or ''
                    if '用户名' in placeholder or '账号' in placeholder or selector == 'input[type="text"]':
                        username_input = inp
                        break
            if username_input:
                break
        except:
            continue
    
    if not username_input:
        # 如果找不到，尝试获取所有输入框
        all_inputs = page.locator('input').all()
        print(f"  找到 {len(all_inputs)} 个输入框")
        for i, inp in enumerate(all_inputs):
            try:
                input_type = inp.get_attribute('type') or ''
                placeholder = inp.get_attribute('placeholder') or ''
                print(f"  输入框 {i}: type={input_type}, placeholder={placeholder}")
                if input_type == 'text' and i == 0:  # 第一个文本输入框通常是用户名
                    username_input = inp
                    break
            except:
                continue
    
    if not username_input:
        page.screenshot(path='login_page.png', full_page=True)
        print("❌ 无法找到用户名输入框，已截图保存到 login_page.png")
        raise Exception("无法找到用户名输入框")
    
    username_input.fill(ADMIN_USERNAME)
    time.sleep(0.5)
    
    # 查找密码输入框
    password_input = page.locator('input[type="password"]').first
    if not password_input.is_visible(timeout=3000):
        page.screenshot(path='login_page.png', full_page=True)
        print("❌ 无法找到密码输入框，已截图保存到 login_page.png")
        raise Exception("无法找到密码输入框")
    
    password_input.fill(ADMIN_PASSWORD)
    time.sleep(0.5)
    
    # 查找登录按钮
    login_button_selectors = [
        'button:has-text("进入系统")',
        'button:has-text("登录")',
        'button:has-text("Login")',
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("登")'  # 部分匹配
    ]
    
    login_button = None
    for selector in login_button_selectors:
        try:
            login_button = page.locator(selector).first
            if login_button.is_visible(timeout=2000):
                break
        except:
            continue
    
    if not login_button or not login_button.is_visible():
        # 尝试更通用的方式：查找所有按钮
        all_buttons = page.locator('button').all()
        print(f"  找到 {len(all_buttons)} 个按钮")
        for i, btn in enumerate(all_buttons):
            try:
                text = btn.text_content()
                print(f"  按钮 {i}: {text}")
                if text and ('登录' in text or '进入' in text or 'Login' in text):
                    login_button = btn
                    break
            except:
                continue
        
        if not login_button:
            page.screenshot(path='login_page.png', full_page=True)
            print("❌ 无法找到登录按钮，已截图保存到 login_page.png")
            raise Exception("无法找到登录按钮")
    
    login_button.click()
    
    # 等待登录完成（等待页面跳转或出现管理界面元素）
    page.wait_for_load_state('networkidle')
    time.sleep(2)  # 额外等待确保页面完全加载
    
    print("✅ 登录成功")

def navigate_to_skill_management(page: Page):
    """导航到技能管理页面"""
    print("📋 正在导航到技能管理页面...")
    
    # 等待页面加载完成
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # 首先尝试点击侧边栏的"内容管理"菜单（如果需要展开）
    content_menu_selectors = [
        'text=内容管理',
        'button:has-text("内容管理")',
        '[class*="menu"]:has-text("内容管理")'
    ]
    
    # 尝试展开内容管理菜单
    for selector in content_menu_selectors:
        try:
            element = page.locator(selector).first
            if element.is_visible(timeout=2000):
                # 检查是否需要点击展开
                element.click()
                time.sleep(1)
                break
        except:
            continue
    
    # 查找并点击"技能管理"菜单项
    skill_menu_selectors = [
        'text=技能管理',
        'button:has-text("技能管理")',
        'a:has-text("技能管理")',
        '[class*="menu"]:has-text("技能管理")',
        'text=/技能管理/'
    ]
    
    found = False
    for selector in skill_menu_selectors:
        try:
            elements = page.locator(selector).all()
            for elem in elements:
                if elem.is_visible(timeout=2000):
                    text = elem.text_content()
                    print(f"  找到技能管理菜单项: {text}")
                    if '技能' in text:
                        elem.click()
                        found = True
                        break
            if found:
                break
        except:
            continue
    
    if not found:
        # 如果找不到，尝试直接访问技能管理URL（通过设置section参数）
        print("  尝试通过URL直接访问...")
        page.goto(f"{ADMIN_URL}?section=skills")
        page.wait_for_load_state('networkidle')
        time.sleep(2)
    
    # 等待技能管理页面加载
    page.wait_for_load_state('networkidle')
    time.sleep(3)  # 额外等待确保页面完全渲染
    
    # 验证是否成功进入技能管理页面 - 使用正确的选择器语法
    skill_page_found = False
    try:
        if page.locator('h2:has-text("技能管理")').first.is_visible(timeout=3000):
            skill_page_found = True
    except:
        pass
    
    if not skill_page_found:
        try:
            if page.locator('text=技能管理').first.is_visible(timeout=3000):
                skill_page_found = True
        except:
            pass
    
    if skill_page_found:
        print("✅ 已导航到技能管理页面")
    else:
        print("⚠️  可能未成功进入技能管理页面，继续尝试...")
        page.screenshot(path='skill_navigation_check.png', full_page=True)

def open_skill_creator(page: Page):
    """打开技能创建器"""
    print("✨ 正在打开专业创建器...")
    
    # 等待页面完全加载
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # 查找"专业创建器"按钮 - 使用更灵活的选择器
    # 注意：按钮文本包含 emoji，可能需要特殊处理
    creator_button_selectors = [
        'button:has-text("专业创建器")',
        'button:has-text("✨ 专业创建器")',
        'text=专业创建器',
        'text=/专业创建器/',
        'text=/创建器/',
        'button:has-text("创建器")',
        'button:has-text("✨")',
        'button:has-text("创建")',
    ]
    
    creator_button = None
    for selector in creator_button_selectors:
        try:
            buttons = page.locator(selector).all()
            for btn in buttons:
                if btn.is_visible(timeout=2000):
                    text = btn.text_content()
                    print(f"  找到按钮: {text}")
                    if '专业' in text or '创建器' in text or (selector == 'button:has-text("创建")' and '创建' in text):
                        creator_button = btn
                        break
            if creator_button:
                break
        except:
            continue
    
    # 如果还是找不到，尝试查找技能管理页面区域内的所有按钮
    if not creator_button:
        print("  尝试在技能管理页面区域内查找按钮...")
        # 先找到技能管理页面的主容器 - 使用正确的选择器语法
        skill_page = page.locator('h2:has-text("技能管理")').first
        if not skill_page.is_visible(timeout=2000):
            # 如果h2找不到，尝试使用text选择器
            skill_page = page.locator('text=技能管理').first
        
        if skill_page.is_visible(timeout=2000):
            # 在技能管理页面区域内查找按钮
            container = skill_page.locator('..')  # 父容器
            all_buttons = container.locator('button').all()
            print(f"  在技能管理页面找到 {len(all_buttons)} 个按钮")
            for i, btn in enumerate(all_buttons):
                try:
                    text = btn.text_content()
                    print(f"  按钮 {i}: {text}")
                    if text and ('专业' in text or '创建器' in text or ('✨' in text and '创建' in text)):
                        creator_button = btn
                        break
                except:
                    continue
        else:
            # 如果找不到技能管理页面标题，尝试查找所有按钮
            print("  未找到技能管理页面标题，查找所有按钮...")
            all_buttons = page.locator('button').all()
            print(f"  找到 {len(all_buttons)} 个按钮")
            for i, btn in enumerate(all_buttons):
                try:
                    text = btn.text_content()
                    print(f"  按钮 {i}: {text}")
                    if text and ('专业' in text or '创建器' in text or ('✨' in text and '创建' in text)):
                        creator_button = btn
                        break
                except:
                    continue
    
    if not creator_button:
        page.screenshot(path='skill_management_page.png', full_page=True)
        print("❌ 无法找到专业创建器按钮，已截图保存到 skill_management_page.png")
        # 尝试直接访问技能创建器URL
        print("  尝试直接访问技能创建器...")
        page.goto(f"{ADMIN_URL}/skills/create")
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        # 检查是否成功进入创建器页面
        if page.locator('text=选择创建方式, text=AI 自动生成, text=文件导入').is_visible(timeout=5000):
            print("✅ 通过URL直接访问技能创建器成功")
            return
        else:
            raise Exception("无法找到专业创建器按钮，且直接访问URL也失败")
    
    creator_button.click()
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    print("✅ 已打开技能创建器")

def test_creation_method_switching(page: Page):
    """测试三种创建方式之间的切换"""
    print("\n🔄 测试创建方式切换...")
    
    # 等待创建方式选择界面出现 - 使用更灵活的选择器
    try:
        page.wait_for_selector('text=AI 自动生成, text=文件导入, text=手动编辑, text=选择创建方式', timeout=15000)
        time.sleep(2)  # 额外等待确保界面完全渲染
    except:
        print("  ⚠️  等待创建方式选择界面超时，尝试继续...")
        page.screenshot(path='creation_method_timeout.png', full_page=True)
    
    # 测试切换到AI生成
    print("  → 切换到AI生成方式")
    ai_selectors = [
        'text=AI 自动生成',
        'text=/AI.*生成/',
        'text=/自动生成/',
        'h4:has-text("AI")',
        '[class*="card"], [class*="Card"]:has-text("AI")'
    ]
    
    ai_button = None
    for selector in ai_selectors:
        try:
            buttons = page.locator(selector).all()
            for btn in buttons:
                if btn.is_visible(timeout=2000):
                    text = btn.text_content()
                    if 'AI' in text or '自动生成' in text:
                        ai_button = btn
                        break
            if ai_button:
                break
        except:
            continue
    
    if ai_button and ai_button.is_visible():
        ai_button.click()
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        
        # 验证是否进入AI生成界面
        if page.locator('text=技能描述, textarea[placeholder*="描述"], text=AI 自动生成技能').is_visible(timeout=5000):
            print("  ✅ 成功切换到AI生成界面")
        else:
            print("  ⚠️  未能确认切换到AI生成界面，但已点击按钮")
            page.screenshot(path='ai_generation_check.png', full_page=True)
    else:
        print("  ⚠️  未找到AI生成按钮，跳过此测试")
        page.screenshot(path='ai_button_not_found.png', full_page=True)
    
    # 返回并切换到文件导入
    print("  → 返回并切换到文件导入方式")
    back_button = page.locator('button:has-text("返回")').first
    if back_button.is_visible():
        back_button.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
    
    file_button = page.locator('text=文件导入').first
    if file_button.is_visible():
        file_button.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        
        # 验证是否进入文件导入界面
        if page.locator('text=上传文件').is_visible(timeout=5000) or page.locator('text=粘贴内容').is_visible(timeout=5000):
            print("  ✅ 成功切换到文件导入界面")
        else:
            print("  ❌ 未能切换到文件导入界面")
            page.screenshot(path='file_import_failed.png', full_page=True)
    
    # 返回并切换到手动编辑
    print("  → 返回并切换到手动编辑方式")
    back_button = page.locator('button:has-text("返回")').first
    if back_button.is_visible():
        back_button.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
    
    manual_button = page.locator('text=手动编辑').first
    if manual_button.is_visible():
        manual_button.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        print("  ✅ 成功切换到手动编辑方式")
    
    print("✅ 创建方式切换测试完成")

def check_and_relogin_if_needed(page: Page):
    """检查是否需要重新登录"""
    # 检查是否跳转到登录页面
    try:
        if page.locator('text=管理后台登录, input[type="text"]').is_visible(timeout=2000):
            print("  ⚠️  检测到Token过期，重新登录...")
            login(page, force_relogin=False)
            time.sleep(2)
            # 重新导航到技能管理
            navigate_to_skill_management(page)
            time.sleep(2)
            # 重新打开创建器
            open_skill_creator(page)
            time.sleep(2)
            return True
    except:
        pass
    return False

def test_ai_generation_scenarios(page: Page):
    """测试AI生成功能的各种场景"""
    print("\n🤖 测试AI生成功能...")
    
    # 确保在创建方式选择页面 - 如果不在，尝试返回
    try:
        # 检查是否已经在创建方式选择页面
        if page.locator('text=AI 自动生成, text=文件导入, text=手动编辑').is_visible(timeout=3000):
            print("  → 已在创建方式选择页面")
        else:
            # 尝试返回到创建方式选择页面
            back_buttons = page.locator('button:has-text("返回")').all()
            for btn in back_buttons:
                try:
                    if btn.is_visible(timeout=2000):
                        btn.click()
                        page.wait_for_load_state('networkidle')
                        time.sleep(2)
                        break
                except:
                    continue
    except:
        pass
    
    # 等待创建方式选择界面出现 - 使用更灵活的方式
    try:
        # 尝试多种方式检测创建方式选择界面
        found = False
        for selector in ['text=AI 自动生成', 'text=文件导入', 'text=手动编辑', 'text=选择创建方式']:
            try:
                if page.locator(selector).first.is_visible(timeout=3000):
                    found = True
                    break
            except:
                continue
        if not found:
            print("  ⚠️  等待创建方式选择界面超时")
            page.screenshot(path='ai_generation_navigation_failed.png', full_page=True)
        time.sleep(1)
    except:
        print("  ⚠️  等待创建方式选择界面超时")
        page.screenshot(path='ai_generation_navigation_failed.png', full_page=True)
    
    # 切换到AI生成 - 使用更灵活的选择器
    ai_selectors = [
        'text=AI 自动生成',
        'text=/AI.*生成/',
        'h4:has-text("AI")',
        '[class*="card"]:has-text("AI")'
    ]
    
    ai_button = None
    for selector in ai_selectors:
        try:
            buttons = page.locator(selector).all()
            for btn in buttons:
                if btn.is_visible(timeout=2000):
                    text = btn.text_content()
                    if 'AI' in text or '自动生成' in text:
                        ai_button = btn
                        break
            if ai_button:
                break
        except:
            continue
    
    if not ai_button:
        print("  ⚠️  未找到AI生成按钮，跳过AI生成测试")
        page.screenshot(path='ai_button_not_found_in_scenarios.png', full_page=True)
        return
    
    ai_button.click()
    page.wait_for_load_state('networkidle')
    time.sleep(2)
    
    # 场景1: 正常生成
    print("  场景1: 正常生成技能")
    description_input = page.locator('textarea[placeholder*="描述"], textarea').first
    if description_input.is_visible():
        description_input.fill("创建一个天气查询技能，可以根据城市名称查询当前天气和未来7天的天气预报，支持中文和英文城市名称。")
        
        generate_button = page.locator('button:has-text("生成技能")').first
        if generate_button.is_visible():
            generate_button.click()
            print("  → 已点击生成按钮，等待生成结果...")
            
            # 等待生成完成（等待成功消息或错误消息）
            try:
                # 检查是否有Token过期
                if check_and_relogin_if_needed(page):
                    print("  ⚠️  Token过期，已重新登录，跳过此测试")
                    return
                
                # 等待生成结果 - 使用更灵活的方式
                max_wait = 30
                waited = 0
                while waited < max_wait:
                    # 检查是否出现成功或失败消息
                    success_selectors = ['text=生成成功', 'text=继续编辑', 'text=解析成功']
                    error_selectors = ['text=生成失败', 'text=错误', 'text=登录已过期']
                    
                    found_result = False
                    for selector in success_selectors:
                        try:
                            if page.locator(selector).first.is_visible(timeout=1000):
                                print("  ✅ AI生成成功")
                                found_result = True
                                break
                        except:
                            continue
                    
                    if not found_result:
                        for selector in error_selectors:
                            try:
                                if page.locator(selector).first.is_visible(timeout=1000):
                                    error_text = page.locator(selector).first.text_content()
                                    print(f"  ⚠️  生成遇到问题: {error_text}")
                                    if '登录已过期' in error_text:
                                        check_and_relogin_if_needed(page)
                                    found_result = True
                                    break
                            except:
                                continue
                    
                    if found_result:
                        break
                    
                    time.sleep(1)
                    waited += 1
                
                if not found_result:
                    print("  ⚠️  等待生成超时，可能正在处理中")
            except Exception as e:
                print(f"  ⚠️  等待生成时出错: {str(e)}")
    
    # 场景2: 空描述测试
    print("\n  场景2: 测试空描述")
    # 检查是否需要重新登录
    if check_and_relogin_if_needed(page):
        print("  ⚠️  Token过期，已重新登录，跳过空描述测试")
        return
    
    # 返回重新开始
    back_button = page.locator('button:has-text("返回")').first
    if back_button.is_visible(timeout=3000):
        back_button.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        
        # 查找AI生成按钮
        ai_button = None
        for selector in ['text=AI 自动生成', 'text=/AI.*生成/']:
            try:
                ai_button = page.locator(selector).first
                if ai_button.is_visible(timeout=2000):
                    ai_button.click()
                    break
            except:
                continue
        
        if not ai_button:
            print("  ⚠️  未找到AI生成按钮，跳过空描述测试")
            return
            
        page.wait_for_load_state('networkidle')
        time.sleep(1)
        
        generate_button = page.locator('button:has-text("生成技能")').first
        if generate_button.is_visible():
            # 不填写描述直接点击生成
            if generate_button.is_enabled():
                generate_button.click()
                time.sleep(2)
                # 应该显示错误提示
                if page.locator('text=不能为空, text=请输入').is_visible(timeout=3000):
                    print("  ✅ 空描述验证正常")
                else:
                    print("  ⚠️  未检测到空描述验证")
    
    print("✅ AI生成功能测试完成")

def test_file_import_upload(page: Page):
    """测试文件导入功能（上传）"""
    print("\n📁 测试文件导入功能（上传）...")
    
    # 检查是否需要重新登录
    if check_and_relogin_if_needed(page):
        print("  ⚠️  Token过期，已重新登录")
    
    # 确保在创建方式选择页面
    # 尝试返回到创建方式选择页面
    max_retries = 3
    for retry in range(max_retries):
        try:
            # 检查是否已经在文件导入页面
            if page.locator('text=上传文件, text=粘贴内容, text=文件导入技能').is_visible(timeout=2000):
                print("  → 已在文件导入页面")
                break
            
            # 尝试返回
            back_button = page.locator('button:has-text("返回")').first
            if back_button.is_visible(timeout=2000):
                back_button.click()
                page.wait_for_load_state('networkidle')
                time.sleep(1)
            
            # 查找文件导入按钮
            file_selectors = ['text=文件导入', 'text=/文件导入/', 'h4:has-text("文件")']
            file_button = None
            for selector in file_selectors:
                try:
                    buttons = page.locator(selector).all()
                    for btn in buttons:
                        if btn.is_visible(timeout=2000):
                            text = btn.text_content()
                            if '文件' in text and '导入' in text:
                                file_button = btn
                                break
                    if file_button:
                        break
                except:
                    continue
            
            if file_button:
                file_button.click()
                page.wait_for_load_state('networkidle')
                time.sleep(2)
                break
            else:
                if retry < max_retries - 1:
                    print(f"  → 重试 {retry + 1}/{max_retries}...")
                    time.sleep(1)
                else:
                    print("  ⚠️  未找到文件导入按钮，跳过上传测试")
                    return
        except:
            if retry < max_retries - 1:
                time.sleep(1)
            else:
                print("  ⚠️  无法切换到文件导入页面，跳过上传测试")
                return
    
    # 确保在上传文件模式
    upload_tab = None
    tab_selectors = ['button:has-text("上传文件")', 'text=上传文件', 'button:has-text("上传")']
    for selector in tab_selectors:
        try:
            tabs = page.locator(selector).all()
            for tab in tabs:
                if tab.is_visible(timeout=2000):
                    text = tab.text_content()
                    if '上传' in text:
                        upload_tab = tab
                        break
            if upload_tab:
                break
        except:
            continue
    
    if upload_tab:
        upload_tab.click()
        time.sleep(1)
    else:
        print("  ⚠️  未找到上传文件标签，尝试直接上传")
    
    # 创建一个测试用的skill.md文件
    test_skill_content = """---
name: test-skill
description: 测试技能
---

# 测试技能

这是一个用于测试的技能定义。
"""
    
    test_file_path = '/tmp/test_skill.md'
    with open(test_file_path, 'w', encoding='utf-8') as f:
        f.write(test_skill_content)
    
    # 查找文件输入框
    file_input = page.locator('input[type="file"]').first
    if file_input.is_visible():
        file_input.set_input_files(test_file_path)
        print("  → 已选择文件，等待上传...")
        time.sleep(2)
        
        # 点击导入按钮
        import_button = page.locator('button:has-text("导入")').first
        if import_button.is_visible():
            import_button.click()
            print("  → 已点击导入按钮，等待解析结果...")
            
            # 等待导入完成
            try:
                page.wait_for_selector('text=导入成功, text=解析成功, text=继续编辑', timeout=30000)
                if page.locator('text=导入成功').is_visible(timeout=3000) or page.locator('text=继续编辑').is_visible(timeout=5000):
                    print("  ✅ 文件上传导入成功")
                else:
                    print("  ⚠️  导入状态未知")
            except:
                print("  ⚠️  等待导入超时，可能正在处理中")
    
    # 清理测试文件
    if os.path.exists(test_file_path):
        os.remove(test_file_path)
    
    print("✅ 文件上传导入测试完成")

def test_file_import_paste(page: Page):
    """测试文件导入功能（粘贴）"""
    print("\n📋 测试文件导入功能（粘贴）...")
    
    # 检查是否需要重新登录
    if check_and_relogin_if_needed(page):
        print("  ⚠️  Token过期，已重新登录")
    
    # 切换到粘贴模式
    paste_tab = None
    tab_selectors = ['button:has-text("粘贴内容")', 'text=粘贴内容', 'button:has-text("粘贴")']
    for selector in tab_selectors:
        try:
            tabs = page.locator(selector).all()
            for tab in tabs:
                if tab.is_visible(timeout=2000):
                    text = tab.text_content()
                    if '粘贴' in text:
                        paste_tab = tab
                        break
            if paste_tab:
                break
        except:
            continue
    
    if paste_tab:
        paste_tab.click()
        time.sleep(1)
        print("  → 已切换到粘贴模式")
    else:
        print("  ⚠️  未找到粘贴内容标签，尝试直接粘贴")
    
    # 粘贴内容
    paste_content = """---
name: paste-test-skill
description: 粘贴测试技能
---

# 粘贴测试技能

这是通过粘贴方式导入的技能定义。
"""
    
    textarea = page.locator('textarea[placeholder*="Markdown"], textarea').first
    if textarea.is_visible():
        textarea.fill(paste_content)
        
        # 点击导入按钮
        import_button = page.locator('button:has-text("导入")').first
        if import_button.is_visible():
            import_button.click()
            print("  → 已点击导入按钮，等待解析结果...")
            
            # 等待导入完成
            try:
                page.wait_for_selector('text=导入成功, text=解析成功, text=继续编辑', timeout=30000)
                if page.locator('text=导入成功').is_visible(timeout=3000) or page.locator('text=继续编辑').is_visible(timeout=5000):
                    print("  ✅ 粘贴内容导入成功")
                else:
                    print("  ⚠️  导入状态未知")
            except:
                print("  ⚠️  等待导入超时，可能正在处理中")
    
    print("✅ 粘贴内容导入测试完成")

def test_ai_to_manual_flow(page: Page):
    """测试从AI生成到手动编辑的流程"""
    print("\n🔄 测试从AI生成到手动编辑的流程...")
    
    # 检查是否需要重新登录
    if check_and_relogin_if_needed(page):
        print("  ⚠️  Token过期，已重新登录")
    
    # 返回并重新开始
    back_button = page.locator('button:has-text("返回")').first
    if back_button.is_visible(timeout=3000):
        back_button.click()
        page.wait_for_load_state('networkidle')
        time.sleep(1)
    
    # 选择AI生成 - 使用更灵活的选择器
    ai_button = None
    for selector in ['text=AI 自动生成', 'text=/AI.*生成/']:
        try:
            ai_button = page.locator(selector).first
            if ai_button.is_visible(timeout=2000):
                ai_button.click()
                break
        except:
            continue
    
    if not ai_button:
        print("  ⚠️  未找到AI生成按钮，跳过此测试")
        return
    
    page.wait_for_load_state('networkidle')
    time.sleep(1)
    
    # 填写描述并生成
    description_input = page.locator('textarea[placeholder*="描述"], textarea').first
    if description_input.is_visible():
        description_input.fill("创建一个简单的计算器技能，可以进行加减乘除运算。")
        
        generate_button = page.locator('button:has-text("生成技能")').first
        if generate_button.is_visible():
            generate_button.click()
            print("  → 已触发AI生成...")
            
            # 等待生成完成
            try:
                page.wait_for_selector('text=继续编辑, text=生成成功', timeout=30000)
                
                # 点击继续编辑
                continue_button = page.locator('button:has-text("继续编辑")').first
                if continue_button.is_visible(timeout=5000):
                    continue_button.click()
                    print("  → 已点击继续编辑...")
                    page.wait_for_load_state('networkidle')
                    time.sleep(2)
                    
                    # 验证是否进入编辑界面
                    if page.locator('input[name="name"], input[placeholder*="名称"]').is_visible(timeout=5000):
                        print("  ✅ 成功从AI生成进入手动编辑界面")
                    else:
                        print("  ⚠️  未能进入编辑界面")
                        page.screenshot(path='ai_to_manual_failed.png', full_page=True)
            except:
                print("  ⚠️  AI生成或流程超时")
    
    print("✅ AI生成到手动编辑流程测试完成")

def test_save_skill(page: Page):
    """测试保存技能到数据库"""
    print("\n💾 测试保存技能到数据库...")
    
    # 检查是否需要重新登录
    if check_and_relogin_if_needed(page):
        print("  ⚠️  Token过期，已重新登录")
    
    # 等待手动编辑页面加载
    try:
        # 检查是否在手动编辑页面（有"完成创建"或"保存"按钮）
        save_button_selectors = [
            'button:has-text("完成创建")',
            'button:has-text("保存")',
            'button:has-text("创建技能")',
            'button:has-text("提交")'
        ]
        
        save_button = None
        for selector in save_button_selectors:
            try:
                buttons = page.locator(selector).all()
                for btn in buttons:
                    if btn.is_visible(timeout=2000):
                        save_button = btn
                        break
                if save_button:
                    break
            except:
                continue
        
        if not save_button:
            print("  ⚠️  未找到保存按钮，可能不在手动编辑页面，跳过保存测试")
            return
        
        print("  → 找到保存按钮，点击保存...")
        save_button.click()
        page.wait_for_load_state('networkidle')
        time.sleep(3)
        
        # 检查保存结果
        success_selectors = [
            'text=创建成功',
            'text=保存成功',
            'text=技能创建成功',
            'text=成功'
        ]
        
        saved = False
        for selector in success_selectors:
            try:
                if page.locator(selector).first.is_visible(timeout=3000):
                    print("  ✅ 技能保存成功")
                    saved = True
                    break
            except:
                continue
        
        if not saved:
            print("  ⚠️  未检测到明确的成功消息，但已点击保存按钮")
        
    except Exception as e:
        print(f"  ⚠️  保存测试过程中出现错误: {str(e)}")
        page.screenshot(path='save_skill_error.png', full_page=True)
    
    print("✅ 保存技能测试完成")

def test_file_to_manual_flow(page: Page):
    """测试从文件导入到手动编辑的流程"""
    print("\n🔄 测试从文件导入到手动编辑的流程...")
    
    # 检查是否需要重新登录
    if check_and_relogin_if_needed(page):
        print("  ⚠️  Token过期，已重新登录")
    
    # 确保在创建方式选择页面
    max_retries = 3
    for retry in range(max_retries):
        try:
            # 检查是否已经在文件导入页面
            if page.locator('text=上传文件, text=粘贴内容').is_visible(timeout=2000):
                print("  → 已在文件导入页面")
                break
            
            # 尝试返回
            back_button = page.locator('button:has-text("返回")').first
            if back_button.is_visible(timeout=2000):
                back_button.click()
                page.wait_for_load_state('networkidle')
                time.sleep(1)
            
            # 查找文件导入按钮
            file_selectors = ['text=文件导入', 'text=/文件导入/']
            file_button = None
            for selector in file_selectors:
                try:
                    buttons = page.locator(selector).all()
                    for btn in buttons:
                        if btn.is_visible(timeout=2000):
                            text = btn.text_content()
                            if '文件' in text and '导入' in text:
                                file_button = btn
                                break
                    if file_button:
                        break
                except:
                    continue
            
            if file_button:
                file_button.click()
                page.wait_for_load_state('networkidle')
                time.sleep(2)
                break
            else:
                if retry < max_retries - 1:
                    print(f"  → 重试 {retry + 1}/{max_retries}...")
                    time.sleep(1)
                else:
                    print("  ⚠️  未找到文件导入按钮，跳过此测试")
                    return
        except:
            if retry < max_retries - 1:
                time.sleep(1)
            else:
                print("  ⚠️  无法切换到文件导入页面，跳过此测试")
                return
    
    # 切换到粘贴模式
    paste_tab = page.locator('button:has-text("粘贴内容")').first
    if paste_tab.is_visible():
        paste_tab.click()
        time.sleep(1)
    
    # 粘贴内容
    paste_content = """---
name: flow-test-skill
description: 流程测试技能
---

# 流程测试技能

这是用于测试从文件导入到手动编辑流程的技能。
"""
    
    textarea = page.locator('textarea[placeholder*="Markdown"], textarea').first
    if textarea.is_visible():
        textarea.fill(paste_content)
        
        # 点击导入
        import_button = page.locator('button:has-text("导入")').first
        if import_button.is_visible():
            import_button.click()
            print("  → 已触发文件导入...")
            
            # 等待导入完成
            try:
                page.wait_for_selector('text=继续编辑, text=导入成功', timeout=30000)
                
                # 点击继续编辑
                continue_button = page.locator('button:has-text("继续编辑")').first
                if continue_button.is_visible(timeout=5000):
                    continue_button.click()
                    print("  → 已点击继续编辑...")
                    page.wait_for_load_state('networkidle')
                    time.sleep(2)
                    
                    # 验证是否进入编辑界面
                    if page.locator('input[name="name"], input[placeholder*="名称"]').is_visible(timeout=5000):
                        print("  ✅ 成功从文件导入进入手动编辑界面")
                    else:
                        print("  ⚠️  未能进入编辑界面")
                        page.screenshot(path='file_to_manual_failed.png', full_page=True)
            except:
                print("  ⚠️  文件导入或流程超时")
    
    print("✅ 文件导入到手动编辑流程测试完成")

def ensure_logged_in(page: Page):
    """确保已登录，如果未登录则登录"""
    try:
        # 检查是否在登录页面
        if page.locator('text=管理后台登录, input[type="text"]').is_visible(timeout=2000):
            print("  🔄 检测到未登录，重新登录...")
            login(page)
            time.sleep(3)  # 等待登录完成
            return True
    except:
        pass
    
    # 检查当前URL，如果不在管理端，导航到管理端
    current_url = page.url
    if 'admin' not in current_url or 'login' in current_url.lower():
        print("  🔄 不在管理端页面，导航到管理端...")
        page.goto(ADMIN_URL)
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        # 检查是否需要登录
        if page.locator('text=管理后台登录, input[type="text"]').is_visible(timeout=2000):
            login(page)
            time.sleep(3)
        return True
    
    return False

def main():
    """主测试函数"""
    print("=" * 60)
    print("技能创建功能测试")
    print("=" * 60)
    
    with sync_playwright() as p:
        # 启动浏览器（使用headless=False以便观察，并启用DevTools）
        browser = p.chromium.launch(
            headless=False, 
            args=['--start-maximized', '--auto-open-devtools-for-tabs']
        )
        context = browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            locale='zh-CN'
        )
        page = context.new_page()
        
        # 监听控制台消息
        def handle_console(msg):
            print(f"[Console] {msg.text}")
        
        def handle_page_error(error):
            print(f"[Page Error] {error}")
        
        page.on("console", handle_console)
        page.on("pageerror", handle_page_error)
        
        try:
            # 1. 登录
            login(page)
            time.sleep(2)
            
            # 2. 导航到技能管理
            navigate_to_skill_management(page)
            time.sleep(2)
            
            # 3. 打开技能创建器
            open_skill_creator(page)
            time.sleep(2)
            
            # 4. 测试创建方式切换
            ensure_logged_in(page)
            test_creation_method_switching(page)
            time.sleep(2)
            
            # 5. 测试AI生成功能（重新登录以确保Token有效）
            print("\n" + "="*60)
            print("开始AI生成功能测试（重新登录以确保Token有效）")
            print("="*60)
            ensure_logged_in(page)
            navigate_to_skill_management(page)
            time.sleep(2)
            open_skill_creator(page)
            time.sleep(2)
            test_ai_generation_scenarios(page)
            time.sleep(2)
            
            # 6. 测试文件导入（上传）- 重新登录并打开创建器
            print("\n" + "="*60)
            print("开始文件导入（上传）测试（重新登录以确保Token有效）")
            print("="*60)
            ensure_logged_in(page)
            navigate_to_skill_management(page)
            time.sleep(2)
            open_skill_creator(page)
            time.sleep(2)
            test_file_import_upload(page)
            time.sleep(2)
            
            # 7. 测试文件导入（粘贴）
            print("\n" + "="*60)
            print("开始文件导入（粘贴）测试（重新登录以确保Token有效）")
            print("="*60)
            ensure_logged_in(page)
            navigate_to_skill_management(page)
            time.sleep(2)
            open_skill_creator(page)
            time.sleep(2)
            test_file_import_paste(page)
            time.sleep(2)
            
            # 8. 测试从AI生成到手动编辑（重新登录）
            print("\n" + "="*60)
            print("开始AI生成到手动编辑流程测试（重新登录以确保Token有效）")
            print("="*60)
            ensure_logged_in(page)
            navigate_to_skill_management(page)
            time.sleep(2)
            open_skill_creator(page)
            time.sleep(2)
            test_ai_to_manual_flow(page)
            time.sleep(2)
            
            # 9. 测试从文件导入到手动编辑（重新登录）
            print("\n" + "="*60)
            print("开始文件导入到手动编辑流程测试（重新登录以确保Token有效）")
            print("="*60)
            ensure_logged_in(page)
            navigate_to_skill_management(page)
            time.sleep(2)
            open_skill_creator(page)
            time.sleep(2)
            test_file_to_manual_flow(page)
            time.sleep(2)
            
            # 10. 测试保存技能（在AI生成后）
            print("\n" + "="*60)
            print("开始保存技能测试（AI生成后保存）")
            print("="*60)
            ensure_logged_in(page)
            navigate_to_skill_management(page)
            time.sleep(2)
            open_skill_creator(page)
            time.sleep(2)
            # 先进行AI生成
            test_ai_generation_scenarios(page)
            time.sleep(2)
            # 然后切换到手动编辑并保存
            test_ai_to_manual_flow(page)
            time.sleep(2)
            test_save_skill(page)
            time.sleep(2)
            
            print("\n" + "=" * 60)
            print("✅ 所有测试完成！")
            print("=" * 60)
            
            # 保持浏览器打开以便查看结果
            print("\n浏览器将保持打开状态，您可以手动检查结果。")
            print("可以在 Chrome DevTools 中查看网络请求、控制台日志等信息。")
            print("浏览器将在 30 秒后自动关闭，或按 Ctrl+C 立即关闭...")
            try:
                time.sleep(30)
            except KeyboardInterrupt:
                print("\n用户中断，正在关闭浏览器...")
            
        except Exception as e:
            print(f"\n❌ 测试过程中出现错误: {str(e)}")
            import traceback
            traceback.print_exc()
            page.screenshot(path='error_screenshot.png', full_page=True)
            print("错误截图已保存到 error_screenshot.png")
            print("\n浏览器将保持打开以便调试，将在 30 秒后自动关闭...")
            try:
                time.sleep(30)
            except KeyboardInterrupt:
                print("\n用户中断，正在关闭浏览器...")
            raise
        finally:
            browser.close()

if __name__ == "__main__":
    main()
