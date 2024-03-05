class Test:
    
    def errors(func):
        def wrapper(self, *args, **kwargs):
            try:
                print("abc")
                return func(self, *args, **kwargs)
            except Exception as e:
                print(f"!!! Error occurred: {e}")
                return False
        return wrapper
    
    
    @errors
    def a(self, b):
        print(b)
        
        
        
a = Test()

a.a(1)